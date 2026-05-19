import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_META_PIXEL_ID, injectMetaPixel } from "@/lib/meta-pixel";

type Settings = { whatsapp: string; metaPixelId: string };

const DEFAULT_SETTINGS: Settings = {
  whatsapp: "8801700000000",
  metaPixelId: DEFAULT_META_PIXEL_ID,
};

let cache: Settings | null = null;
const listeners = new Set<(s: Settings) => void>();

async function load() {
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  const next: Settings = {
    whatsapp: data?.whatsapp_number ?? DEFAULT_SETTINGS.whatsapp,
    metaPixelId: data?.meta_pixel_id?.trim() || DEFAULT_META_PIXEL_ID,
  };
  cache = next;
  listeners.forEach((l) => l(next));
  return next;
}

export function useSiteSettings(): Settings {
  const [s, setS] = useState<Settings>(cache ?? DEFAULT_SETTINGS);
  useEffect(() => {
    listeners.add(setS);
    if (!cache) load();
    return () => {
      listeners.delete(setS);
    };
  }, []);
  return s;
}

export function MetaPixelLoader() {
  const { metaPixelId } = useSiteSettings();
  useEffect(() => {
    if (metaPixelId) injectMetaPixel(metaPixelId);
  }, [metaPixelId]);
  return null;
}
