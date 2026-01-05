export type AnalyticsEventName =
  | "checkout_started"
  | "checkout_completed"
  | "entitlement_granted"
  | "payment_failed"
  | "entitlement_revoked";

export type AnalyticsProps = Record<string, unknown>;

export function track(eventName: AnalyticsEventName, props: AnalyticsProps = {}): void {
  // Replace with a real analytics sink in overlay.
  console.log("[analytics]", eventName, props);
}
