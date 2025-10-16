import type { ProfileEvent } from "~/types/pages/profile";

export const profileEventsSample: ProfileEvent[] = [
  {
    id: "team-sync",
    title: "Weekly Team Sync",
    description: "Catch up on project progress and upcoming milestones.",
    start: "2025-02-03 15:00",
    end: "2025-02-03 16:00",
    location: "Conference Room 2A",
    color: "#4f46e5",
  },
  {
    id: "design-review",
    title: "Design Review",
    description: "Review the latest design iterations for the mobile app.",
    start: "2025-02-05 18:30",
    end: "2025-02-05 19:30",
    location: "Hybrid (HQ + Zoom)",
    color: "#059669",
  },
  {
    id: "product-launch",
    title: "Product Launch Planning",
    description: "Finalize the timeline and responsibilities for the spring launch.",
    start: "2025-02-07 14:00",
    end: "2025-02-07 15:30",
    location: "Innovation Lab",
    color: "#dc2626",
  },
];
