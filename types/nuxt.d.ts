import type { AlertMessage } from "~/types/alert-panel";

declare module "#app" {
  interface NuxtApp {
    $notify: (alert: AlertMessage) => string;
    $clearAlerts: () => void;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $notify: (alert: AlertMessage) => string;
    $clearAlerts: () => void;
  }
}

export {};
