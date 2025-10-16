import type { ProfileEvent } from "~/types/pages/profile";

export const profileEventsSample: ProfileEvent[] = [
  {
    id: "team-sync",
    title: "Weekly Team Sync",
    description: "Catch up on project progress and upcoming milestones.",
    start: "2025-02-03T15:00:00.000Z",
    end: "2025-02-03T16:00:00.000Z",
    location: "Conference Room 2A",
    color: "#4f46e5",
  },
  {
    id: "design-review",
    title: "Design Review",
    description: "Review the latest design iterations for the mobile app.",
    start: "2025-02-05T18:30:00.000Z",
    end: "2025-02-05T19:30:00.000Z",
    location: "Hybrid (HQ + Zoom)",
    color: "#059669",
  },
  {
    id: "product-launch",
    title: "Product Launch Planning",
    description: "Finalize the timeline and responsibilities for the spring launch.",
    start: "2025-02-07T14:00:00.000Z",
    end: "2025-02-07T15:30:00.000Z",
    location: "Innovation Lab",
    color: "#dc2626",
  },
];
