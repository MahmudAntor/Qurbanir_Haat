import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { MetaPixelLoader } from "@/lib/use-site-settings";

type PublicRuntimeEnv = {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
};

declare global {
  interface Window {
    __QURBANIR_HAAT_ENV__?: Partial<PublicRuntimeEnv>;
  }
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function getPublicRuntimeEnv(): PublicRuntimeEnv {
  if (typeof window === "undefined") {
    return {
      SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
      SUPABASE_PUBLISHABLE_KEY:
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || "",
    };
  }

  return {
    SUPABASE_URL: "",
    SUPABASE_PUBLISHABLE_KEY: "",
  };
}

function getPublicRuntimeEnvScript() {
  const json = JSON.stringify(getPublicRuntimeEnv()).replace(/</g, "\\u003c");
  return `window.__QURBANIR_HAAT_ENV__=${json};`;
}

function reportClientError(error: Error) {
  if (typeof window === "undefined") {
    console.error(error);
    return;
  }

  const payload = JSON.stringify({
    name: error.name,
    message: error.message,
    stack: error.stack,
    href: window.location.href,
    userAgent: window.navigator.userAgent,
  });

  if (window.navigator.sendBeacon) {
    const body = new Blob([payload], { type: "application/json" });
    window.navigator.sendBeacon("/api/client-error", body);
    return;
  }

  fetch("/api/client-error", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // The error boundary must never throw while reporting another error.
  });
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  if (typeof window === "undefined") {
    console.error(error);
  }

  useEffect(() => {
    reportClientError(error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background px-4"
      style={{
        alignItems: "center",
        background: "#fffdfa",
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <div className="max-w-md text-center" style={{ maxWidth: "720px", textAlign: "center" }}>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Bhumi Bovine — Premium Qurbani Cattle, Delivered" },
      {
        name: "description",
        content:
          "Hand-picked, health-certified Qurbani cattle from our farms — transparent pricing, free delivery across Bangladesh.",
      },
      { name: "author", content: "Bhumi Bovine" },
      {
        property: "og:title",
        content: "Bhumi Bovine — Premium Qurbani Cattle",
      },
      {
        property: "og:description",
        content: "Hand-picked, health-certified Qurbani cattle delivered to your door.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@BhumiBovine" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: getPublicRuntimeEnvScript() }}
        />
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <MetaPixelLoader />
      <Outlet />
    </QueryClientProvider>
  );
}
