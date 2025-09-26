import type { AlertMessage } from "~/types/alert-panel";
import type { MercureEventSourceFactory } from "~/types/mercure";

declare module "#app" {
  interface NuxtApp {
    $notify: (alert: AlertMessage) => string;
    $clearAlerts: () => void;
    $mercure: MercureEventSourceFactory;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $notify: (alert: AlertMessage) => string;
    $clearAlerts: () => void;
    $mercure: MercureEventSourceFactory;
  }
}

export {};
