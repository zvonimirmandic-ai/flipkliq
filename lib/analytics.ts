declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}
