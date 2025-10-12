export interface MessengerPreviewEntry {
  id: string;
  title: string;
  sender: string;
  snippet: string;
  timeAgo: string;
  unread: boolean;
  unreadCount: number;
  avatarUrl: string | null;
  initials: string;
}
