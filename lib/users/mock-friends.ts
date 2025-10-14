import type { FriendCard } from "~/types/pages/profile";

export const friendCards: FriendCard[] = [
  {
    id: "amina-rahman",
    name: "Amina Rahman",
    headline: "Lead Product Designer · Flowbase",
    avatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Casablanca, Morocco",
    mutualCount: 12,
    status: "online",
    tags: ["Design systems", "Accessibility"],
    segments: ["design", "product"],
    lastActive: "5 min",
    bio: "Exploring inclusive design for large platforms and mentoring early-career designers.",
  },
  {
    id: "leo-martinez",
    name: "Leo Martínez",
    headline: "Senior Frontend Engineer · Alloy",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Madrid, Spain",
    mutualCount: 18,
    status: "focus",
    tags: ["Nuxt", "Design systems"],
    segments: ["engineering", "product"],
    lastActive: "Just now",
    bio: "Leading the design system implementation and coaching cross-functional squads.",
  },
  {
    id: "noor-hassan",
    name: "Noor Hassan",
    headline: "Community Strategist · Orbit",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Dubai, UAE",
    mutualCount: 9,
    status: "online",
    tags: ["Community", "Storytelling"],
    segments: ["marketing", "product"],
    lastActive: "12 min",
    bio: "Scaling partnerships through curated learning circles and thoughtful rituals.",
  },
  {
    id: "sasha-ivanov",
    name: "Sasha Ivanov",
    headline: "Staff Software Engineer · Vertex",
    avatar:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Berlin, Germany",
    mutualCount: 7,
    status: "busy",
    tags: ["Performance", "TypeScript"],
    segments: ["engineering"],
    lastActive: "25 min",
    bio: "Improving performance budgets and tooling for globally distributed teams.",
  },
  {
    id: "harper-lee",
    name: "Harper Lee",
    headline: "Growth Marketing Lead · Sail",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Toronto, Canada",
    mutualCount: 14,
    status: "online",
    tags: ["Lifecycle", "Analytics"],
    segments: ["marketing"],
    lastActive: "2 min",
    bio: "Designing lifecycle journeys and community programs for product-led growth.",
  },
  {
    id: "meera-kapoor",
    name: "Meera Kapoor",
    headline: "Principal Product Manager · Aurora",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Bengaluru, India",
    mutualCount: 21,
    status: "focus",
    tags: ["Roadmaps", "Discovery"],
    segments: ["product"],
    lastActive: "8 min",
    bio: "Championing discovery frameworks and inclusive roadmap rituals across teams.",
  },
  {
    id: "julien-morel",
    name: "Julien Morel",
    headline: "Design Operations Manager · Lumen",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Paris, France",
    mutualCount: 10,
    status: "offline",
    tags: ["Ops", "Workshops"],
    segments: ["design", "product"],
    lastActive: "2 h",
    bio: "Connecting research, content, and design practices through workshops and rituals.",
  },
  {
    id: "ayesha-rahim",
    name: "Ayesha Rahim",
    headline: "Solutions Engineer · Stripe",
    avatar:
      "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Singapore",
    mutualCount: 11,
    status: "online",
    tags: ["Integrations", "Workflows"],
    segments: ["engineering", "product"],
    lastActive: "3 min",
    bio: "Bridging product discovery with implementation for enterprise customers.",
  },
  {
    id: "daniel-cho",
    name: "Daniel Cho",
    headline: "Brand Strategist · Northwind",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=facearea&w=160&h=160&q=80",
    location: "Seoul, South Korea",
    mutualCount: 6,
    status: "offline",
    tags: ["Narrative", "Workshops"],
    segments: ["marketing", "design"],
    lastActive: "5 h",
    bio: "Building narrative frameworks and brand playbooks for community-led launches.",
  },
];

export const featuredFriendIds = ["amina-rahman", "leo-martinez", "meera-kapoor"] as const;

export function findFriendById(id: string) {
  return friendCards.find((friend) => friend.id === id);
}
