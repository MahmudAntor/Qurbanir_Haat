import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_META_PIXEL_ID, injectMetaPixel } from "@/lib/meta-pixel";

type Settings = {
  whatsapp: string;
  whatsappDisplay: string;
  contactEmail: string;
  contactLocation: string;
  metaPixelId: string;
};

const DEFAULT_SETTINGS: Settings = {
  whatsapp: "8801715155505",
  whatsappDisplay: "01715155505",
  contactEmail: "info.qurbanirhaat@gmail.com",
  contactLocation: "Dhaka, Bangladesh",
  metaPixelId: DEFAULT_META_PIXEL_ID,
};

let cache: Settings | null = null;
const listeners = new Set<(s: Settings) => void>();

async function load() {
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  const whatsapp = normalizeWhatsapp(data?.whatsapp_number);
  const next: Settings = {
    whatsapp,
    whatsappDisplay: formatBangladeshPhone(whatsapp),
    contactEmail: data?.contact_email?.trim() || DEFAULT_SETTINGS.contactEmail,
    contactLocation: data?.contact_location?.trim() || DEFAULT_SETTINGS.contactLocation,
    metaPixelId: data?.meta_pixel_id?.trim() || DEFAULT_META_PIXEL_ID,
  };
  cache = next;
  listeners.forEach((l) => l(next));
  return next;
}

function normalizeWhatsapp(value: string | null | undefined) {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (!digits || digits === "8801700000000") return DEFAULT_SETTINGS.whatsapp;
  return digits;
}

function formatBangladeshPhone(value: string) {
  if (value.startsWith("880") && value.length === 13) return `0${value.slice(3)}`;
  return value;
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
