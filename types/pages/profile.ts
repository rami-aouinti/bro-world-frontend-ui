import type { AuthUser } from "~/types/auth";

export interface ProfileDetails {
  id?: string;
  title?: string | null;
  phone?: string | null;
  birthday?: string | null;
  gender?: string | null;
  photo?: string | null;
  description?: string | null;
  address?: string | null;
  hometown?: string | null;
  schools?: string[] | null;
}

export interface FriendProfile {
  id?: string | null;
  title?: string | null;
  photo?: string | null;
}

export interface FriendStory {
  id?: string | null;
  mediaPath?: string | null;
  expiresAt?: string | null;
}

export interface FriendUserDetails {
  id?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profile?: FriendProfile | null;
  language?: string | null;
  locale?: string | null;
  timezone?: string | null;
  enabled?: boolean | null;
}

export interface FriendEntry {
  user?: FriendUserDetails | null;
  stories?: FriendStory[] | null;
  status?: number | null;
}

export interface ProfileUser extends AuthUser {
  profile?: ProfileDetails | null;
  stories?: unknown[] | null;
  friends?: Record<string, FriendEntry | null> | FriendEntry[] | null;
}

export interface SidebarFriend {
  id?: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name: string;
  avatar: string;
  profile: FriendProfile | null;
  status?: number | null;
  stories: FriendStory[];
}

export interface SessionEntry {
  id: string;
  device: string;
  location: string;
  activity: string;
  status: string;
}

export interface ProfileForm {
  firstName: string;
  lastName: string;
  headline: string;
  pronouns: string | null;
  language: string;
  timezone: string | null;
  email: string;
  phone: string;
  location: string;
  website: string;
  bio: string;
  skills: string[];
  interests: string[];
  social: {
    linkedin: string;
    twitter: string;
    dribbble: string;
    behance: string;
  };
}

export interface FriendCard {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  location: string;
  mutualCount: number;
  status: "online" | "offline" | "busy" | "focus";
  tags: string[];
  segments: ("design" | "product" | "engineering" | "marketing")[];
  lastActive: string;
  bio: string;
}

export interface PhotoItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  category: string;
  takenAt: string;
  ratio: number;
  filter: string;
}

export interface AlbumSummary {
  id: string;
  title: string;
  description: string;
  cover: string;
  count: number;
  location: string;
  updated: string;
}
