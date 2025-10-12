export interface Story {
  id: string | number;
  image?: string;
  name?: string;
  avatar?: string;
  state?: "create" | "new" | "seen";
  duration?: string;
}

export interface StoryReaction {
  id: string;
  emoji: string;
  label: string;
}
