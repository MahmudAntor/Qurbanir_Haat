import { createFileRoute } from "@tanstack/react-router";

const MAX_FIELD_LENGTH = 4000;
const MAX_BODY_LENGTH = 20000;

function readString(value: unknown, maxLength = MAX_FIELD_LENGTH) {
  if (typeof value !== "string") return undefined;
  return value.slice(0, maxLength);
}

function readPayload(raw: string) {
  try {
    const parsed: unknown = JSON.parse(raw.slice(0, MAX_BODY_LENGTH));
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      return {};
    }
    const fields = parsed as Record<string, unknown>;
    return {
      name: readString(fields.name, 200),
      message: readString(fields.message),
      stack: readString(fields.stack, 10000),
      href: readString(fields.href, 1000),
      userAgent: readString(fields.userAgent, 1000),
    };
  } catch {
    return { raw: raw.slice(0, MAX_FIELD_LENGTH) };
  }
}

export const Route = createFileRoute("/api/client-error")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const raw = await request.text();
        const payload = readPayload(raw);
        const { logError } = await import("@/lib/server-logger");

        logError("Client route error", undefined, {
          ...payload,
          ip:
            request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? undefined,
          referer: request.headers.get("referer") ?? undefined,
        });

        return new Response(null, { status: 204 });
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            allow: "POST, OPTIONS",
          },
        }),
    },
  },
});
