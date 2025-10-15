import type { AlertMessage } from "~/types/alert-panel";
import type { ApiFetcher } from "~/lib/api/http-client";
import type { MercureEventSourceFactory } from "~/types/mercure";

declare module "#app" {
  interface NuxtApp {
    $api?: ApiFetcher;
    $notify: (alert: AlertMessage) => string;
    $clearAlerts: () => void;
    $mercure: MercureEventSourceFactory;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $api?: ApiFetcher;
    $notify: (alert: AlertMessage) => string;
    $clearAlerts: () => void;
    $mercure: MercureEventSourceFactory;
  }
}

export {};
