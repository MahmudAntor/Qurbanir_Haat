import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { logError, logInfo, patchConsoleLogging } from "./lib/server-logger";

patchConsoleLogging();
logInfo("Server module loaded", {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  pid: process.pid,
});

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(
  request: Request,
  response: Response,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    logError("SSR returned a 500 response", undefined, {
      method: request.method,
      url: request.url,
      status: response.status,
      contentType,
    });
    return response;
  }

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    logError("SSR returned a 500 JSON response", undefined, {
      method: request.method,
      url: request.url,
      status: response.status,
      contentType,
      body: body.slice(0, 2000),
    });
    return response;
  }

  const capturedError = consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`);
  logError("Catastrophic SSR error", capturedError, {
    method: request.method,
    url: request.url,
    status: response.status,
    body,
  });
  console.error(capturedError);
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(request, response);
    } catch (error) {
      logError("Unhandled server fetch error", error, {
        method: request.method,
        url: request.url,
      });
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
