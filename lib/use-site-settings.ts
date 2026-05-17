import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Settings = { whatsapp: string; metaPixelId: string | null };

let cache: Settings | null = null;
const listeners = new Set<(s: Settings) => void>();

async function load() {
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  const next: Settings = {
    whatsapp: data?.whatsapp_number ?? "8801700000000",
    metaPixelId: data?.meta_pixel_id ?? null,
  };
  cache = next;
  listeners.forEach((l) => l(next));
  return next;
}

export function useSiteSettings(): Settings {
  const [s, setS] = useState<Settings>(cache ?? { whatsapp: "8801700000000", metaPixelId: null });
  useEffect(() => {
    listeners.add(setS);
    if (!cache) load();
    return () => {
      listeners.delete(setS);
    };
  }, []);
  return s;
}

export function injectMetaPixel(pixelId: string) {
  if (typeof window === "undefined") return;
  if (window.fbq) return;
  /* eslint-disable */
  // @ts-ignore
  (function (f: any, b, e, v, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  // @ts-ignore
  window.fbq("init", pixelId);
  // @ts-ignore
  window.fbq("track", "PageView");
  /* eslint-enable */
}

export function MetaPixelLoader() {
  const { metaPixelId } = useSiteSettings();
  useEffect(() => {
    if (metaPixelId) injectMetaPixel(metaPixelId);
  }, [metaPixelId]);
  return null;
}
