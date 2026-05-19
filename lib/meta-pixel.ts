export const DEFAULT_META_PIXEL_ID = "1985772175647853";

const META_PIXEL_SCRIPT_URL = "https://connect.facebook.net/en_US/fbevents.js";

type MetaPixelArguments = Parameters<NonNullable<Window["fbq"]>>;
type MetaPixelQueueFunction = ((...args: MetaPixelArguments) => void) & {
  callMethod?: (...args: MetaPixelArguments) => void;
  queue: MetaPixelArguments[];
  push: MetaPixelQueueFunction;
  loaded: boolean;
  version: string;
};

export function getMetaPixelBaseCode(pixelId = DEFAULT_META_PIXEL_ID) {
  const serializedPixelId = JSON.stringify(pixelId);

  return `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'${META_PIXEL_SCRIPT_URL}');
fbq('init', ${serializedPixelId});
fbq('track', 'PageView');`;
}

export function getMetaPixelNoScriptUrl(pixelId = DEFAULT_META_PIXEL_ID) {
  return `https://www.facebook.com/tr?id=${encodeURIComponent(pixelId)}&ev=PageView&noscript=1`;
}

export function injectMetaPixel(pixelId: string) {
  const normalizedPixelId = pixelId.trim();
  if (typeof window === "undefined" || !normalizedPixelId || window.fbq) return;

  const fbq = function (...args: MetaPixelArguments) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }

    fbq.queue.push(args);
  } as MetaPixelQueueFunction;

  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];

  const script = document.createElement("script");
  script.async = true;
  script.src = META_PIXEL_SCRIPT_URL;

  const firstScript = document.getElementsByTagName("script")[0];
  firstScript.parentNode?.insertBefore(script, firstScript);

  fbq("init", normalizedPixelId);
  fbq("track", "PageView");
}
