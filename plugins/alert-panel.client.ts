import type { AlertMessage } from "~/types/alert-panel";
import { useAlertPanel } from "~/stores/useAlertPanel";

export default defineNuxtPlugin({
  name: "alert-panel",
  dependsOn: ["pinia-plugin"],
  setup() {
    const alertStore = useAlertPanel();

    function notify(alert: AlertMessage) {
      return alertStore.push(alert);
    }

    function clearAlerts() {
      alertStore.clear();
    }

    return {
      provide: {
        notify,
        clearAlerts,
      },
    };
  },
});
