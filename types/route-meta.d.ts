import type { RightSidebarPreset } from "~/types/right-sidebar";

declare module "vue-router" {
  interface RouteMeta {
    showNavbar?: boolean;
    showRightWidgets?: boolean;
    showContactSidebarCard?: boolean;
    rightSidebarPreset?: RightSidebarPreset;
  }
}

export {};
