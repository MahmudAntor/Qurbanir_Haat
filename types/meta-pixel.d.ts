type MetaPixelFunction = (
  command: string,
  eventOrPixelId?: string,
  parameters?: Record<string, unknown>,
) => void;

interface Window {
  fbq?: MetaPixelFunction;
  _fbq?: MetaPixelFunction;
}
