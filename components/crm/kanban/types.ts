import type { CrmBoardTaskPriority, CrmBoardTaskStatus } from "~/stores/crm-board";

export interface KanbanDisplayTask {
  id: string;
  title: string;
  projectName: string;
  projectKey: string;
  projectColor: string;
  assigneeName: string | null;
  assigneeInitials: string | null;
  assigneeColor: string | null;
  status: CrmBoardTaskStatus;
  priority: CrmBoardTaskPriority;
  priorityColor: string;
  priorityTextColor: string;
  dueDateLabel: string | null;
  dueDateValue: string | null;
  description?: string;
  order: number;
  createdAt: string;
}

export interface KanbanColumnMeta {
  status: CrmBoardTaskStatus;
  title: string;
  subtitle: string;
  accentColor: string;
  backgroundColor: string;
  icon: string;
}
