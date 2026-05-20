type ImageFit = "contain" | "cover" | "fill";

type ImageOptions = {
  width?: number;
  height?: number;
  fit?: ImageFit;
  quality?: number;
};

const PRODUCTION_HOSTS = new Set([
  "qurbanirhaat.online",
  "www.qurbanirhaat.online",
  "gentle-moonbeam-d7fd66.netlify.app",
]);

function canUseNetlifyImageCdn() {
  if (!import.meta.env.PROD) return false;

  if (typeof window !== "undefined") {
    return (
      PRODUCTION_HOSTS.has(window.location.hostname) ||
      window.location.hostname.endsWith(".netlify.app")
    );
  }

  return true;
}

export function optimizedImageUrl(src: string | null | undefined, options: ImageOptions = {}) {
  if (!src || !canUseNetlifyImageCdn()) return src ?? "";

  const params = new URLSearchParams({ url: src });
  if (options.width) params.set("w", String(options.width));
  if (options.height) params.set("h", String(options.height));
  if (options.fit) params.set("fit", options.fit);
  if (options.quality) params.set("q", String(options.quality));

  return `/.netlify/images?${params.toString()}`;
}

export function optimizedImageSrcSet(
  src: string | null | undefined,
  widths: number[],
  options: Omit<ImageOptions, "width"> = {},
) {
  if (!src || !canUseNetlifyImageCdn()) return undefined;

  return widths
    .map((width) => `${optimizedImageUrl(src, { ...options, width })} ${width}w`)
    .join(", ");
}
