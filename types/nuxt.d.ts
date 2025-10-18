import type { $Fetch } from "ofetch";
import type { AlertMessage } from "~/types/alert-panel";
import type { ApiFetcher } from "~/lib/api/http-client";
import type { MercureEventSourceFactory } from "~/types/mercure";

declare module "#app" {
  interface NuxtApp {
    $api?: ApiFetcher;
    $fetch: $Fetch;
    $notify: (alert: AlertMessage) => string;
    $clearAlerts: () => void;
    $mercure: MercureEventSourceFactory;
    $html2pdf?: () => Promise<typeof window.html2pdf | null>;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $api?: ApiFetcher;
    $fetch: $Fetch;
    $notify: (alert: AlertMessage) => string;
    $clearAlerts: () => void;
    $mercure: MercureEventSourceFactory;
    $html2pdf?: () => Promise<typeof window.html2pdf | null>;
  }
}

declare global {
  interface Window {
    html2pdf?: () => {
      from: (element: HTMLElement) => {
        set: (options: Record<string, unknown>) => unknown;
        save: (fileName: string) => unknown;
      } & {
        set?: (options: Record<string, unknown>) => unknown;
        save?: (fileName: string) => unknown;
      };
    };
  }
}

export {};
