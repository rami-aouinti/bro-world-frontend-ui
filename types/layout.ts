export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color?: "primary" | "success" | "warning" | "info" | "error";
  read?: boolean;
}
