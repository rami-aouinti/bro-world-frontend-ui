import type { FriendEntry, ProfileEvent, ProfileUser } from "~/types/pages/profile";

const profileFriendsSample: FriendEntry[] = [
  {
    user: {
      id: "anna-chen",
      username: "anna.chen",
      email: "anna.chen@example.com",
      firstName: "Anna",
      lastName: "Chen",
      profile: {
        title: "Principal UX Researcher",
        photo:
          "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?auto=format&fit=facearea&w=160&h=160&q=80",
      },
      language: "en",
      locale: "en-US",
      timezone: "America/Los_Angeles",
    },
    stories: [
      {
        id: "anna-story",
        mediaPath:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=320&h=480&q=80",
        expiresAt: "2025-02-06T18:00:00Z",
      },
    ],
    status: 1,
  },
  {
    user: {
      id: "david-ibrahimi",
      username: "david.ibrahimi",
      email: "david.ibrahimi@example.com",
      firstName: "David",
      lastName: "Ibrahimi",
      profile: {
        title: "Staff Platform Engineer",
        photo:
          "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=facearea&w=160&h=160&q=80",
      },
      language: "en",
      locale: "en-GB",
      timezone: "Europe/London",
    },
    stories: [
      {
        id: "david-story",
        mediaPath:
          "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=320&h=480&q=80",
        expiresAt: "2025-02-07T09:30:00Z",
      },
      {
        id: "david-story-2",
        mediaPath:
          "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=320&h=480&q=80",
        expiresAt: "2025-02-08T14:15:00Z",
      },
    ],
    status: 2,
  },
  {
    user: {
      id: "sofia-rahman",
      username: "sofia.rahman",
      email: "sofia.rahman@example.com",
      firstName: "Sofia",
      lastName: "Rahman",
      profile: {
        title: "Head of Community",
        photo:
          "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=160&h=160&q=80",
      },
      language: "en",
      locale: "en-SG",
      timezone: "Asia/Singapore",
    },
    stories: [],
    status: 0,
  },
];

export const profileSample: ProfileUser = {
  id: "mira-hart",
  username: "mira.hart",
  email: "mira.hart@example.com",
  firstName: "Mira",
  lastName: "Hart",
  roles: ["member", "moderator"],
  enabled: true,
  language: "en",
  locale: "en-CA",
  timezone: "America/Toronto",
  profile: {
    title: "Director of Community Experience",
    phone: "+1 (555) 214-8890",
    birthday: "1989-06-12",
    gender: "she/her",
    photo:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=320&h=320&q=80",
    description:
      "Designing inclusive programs, elevating member voices, and building communities that thrive across continents.",
    address: "Portland, Oregon, USA",
    hometown: "Casablanca, Morocco",
    schools: ["University of British Columbia", "Parsons School of Design"],
  },
  stories: [
    {
      id: "sunrise-session",
      mediaPath:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=320&h=480&q=80",
      expiresAt: "2025-02-06T07:45:00Z",
    },
    {
      id: "community-cafe",
      mediaPath:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=320&h=480&q=80",
      expiresAt: "2025-02-07T17:30:00Z",
    },
  ],
  friends: profileFriendsSample,
};

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
