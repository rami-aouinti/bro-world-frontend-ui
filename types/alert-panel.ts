export type AlertType = "error" | "warning" | "info" | "success";

export interface AlertAction {
  label: string;
  onClick: () => void | Promise<void>;
}

export interface AlertMessage {
  id?: string;
  type: AlertType;
  message: string;
  title?: string;
  actions?: AlertAction[];
  timeout?: number | null;
}
