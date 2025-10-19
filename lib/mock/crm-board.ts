export type CrmBoardTaskStatus = "todo" | "in-progress" | "review" | "done";
export type CrmBoardTaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface CrmBoardUserMockEntry {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
}

export interface CrmBoardProjectMockEntry {
  id: string;
  name: string;
  key: string;
  color: string;
  ownerId: string;
  createdAt: string;
}

export interface CrmBoardSprintMockEntry {
  id: string;
  name: string;
  start: string;
  end: string;
  isActive?: boolean;
}

export interface CrmBoardTaskMockEntry {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  sprintId: string;
  assigneeId?: string;
  status: CrmBoardTaskStatus;
  priority: CrmBoardTaskPriority;
  dueDate?: string | null;
  createdAt: string;
  order: number;
}

export const crmBoardCurrentUserId = "usr-201";

export const crmBoardUsersMock: CrmBoardUserMockEntry[] = [
  {
    id: "usr-201",
    name: "Camille Bernard",
    initials: "CB",
    avatarColor: "#2563eb",
  },
  {
    id: "usr-202",
    name: "Imane Farah",
    initials: "IF",
    avatarColor: "#ec4899",
  },
  {
    id: "usr-203",
    name: "Louis Martín",
    initials: "LM",
    avatarColor: "#f97316",
  },
  {
    id: "usr-204",
    name: "Sofia Carvalho",
    initials: "SC",
    avatarColor: "#10b981",
  },
  {
    id: "usr-205",
    name: "Nassim Belaïd",
    initials: "NB",
    avatarColor: "#8b5cf6",
  },
];

export const crmBoardProjectsMock: CrmBoardProjectMockEntry[] = [
  {
    id: "crm-prj-001",
    name: "Portail Client",
    key: "CLI",
    color: "#3b82f6",
    ownerId: "usr-201",
    createdAt: "2023-11-15T09:20:00Z",
  },
  {
    id: "crm-prj-002",
    name: "Data Warehouse",
    key: "DATA",
    color: "#8b5cf6",
    ownerId: "usr-201",
    createdAt: "2024-01-10T12:05:00Z",
  },
  {
    id: "crm-prj-003",
    name: "Migration Cloud",
    key: "CLOUD",
    color: "#f97316",
    ownerId: "usr-204",
    createdAt: "2023-07-30T10:00:00Z",
  },
  {
    id: "crm-prj-004",
    name: "Support IA",
    key: "SUP",
    color: "#22c55e",
    ownerId: "usr-201",
    createdAt: "2023-09-12T14:50:00Z",
  },
];

export const crmBoardSprintsMock: CrmBoardSprintMockEntry[] = [
  {
    id: "crm-sprint-001",
    name: "Sprint Alpha",
    start: "2024-02-05T00:00:00Z",
    end: "2024-02-16T00:00:00Z",
  },
  {
    id: "crm-sprint-002",
    name: "Sprint Beta",
    start: "2024-02-19T00:00:00Z",
    end: "2024-03-01T00:00:00Z",
    isActive: true,
  },
  {
    id: "crm-sprint-003",
    name: "Sprint Gamma",
    start: "2024-03-04T00:00:00Z",
    end: "2024-03-15T00:00:00Z",
  },
];

export const crmBoardTasksMock: CrmBoardTaskMockEntry[] = [
  {
    id: "crm-task-001",
    title: "Audit expérience d'inscription",
    description: "Analyser les étapes actuelles pour identifier les abandons.",
    projectId: "crm-prj-001",
    sprintId: "crm-sprint-002",
    assigneeId: "usr-201",
    status: "todo",
    priority: "High",
    dueDate: "2024-02-21T00:00:00Z",
    createdAt: "2024-02-19T08:30:00Z",
    order: 1,
  },
  {
    id: "crm-task-002",
    title: "Prototype du tunnel simplifié",
    description: "Créer un prototype haute fidélité et préparer les tests.",
    projectId: "crm-prj-001",
    sprintId: "crm-sprint-002",
    assigneeId: "usr-202",
    status: "in-progress",
    priority: "Urgent",
    dueDate: "2024-02-23T00:00:00Z",
    createdAt: "2024-02-19T09:45:00Z",
    order: 1,
  },
  {
    id: "crm-task-003",
    title: "Sélection des clients pilotes",
    description: "Identifier un panel représentatif pour les tests.",
    projectId: "crm-prj-001",
    sprintId: "crm-sprint-002",
    assigneeId: "usr-203",
    status: "in-progress",
    priority: "Medium",
    dueDate: "2024-02-22T00:00:00Z",
    createdAt: "2024-02-19T11:05:00Z",
    order: 2,
  },
  {
    id: "crm-task-004",
    title: "Modélisation des pipelines ETL",
    description: "Documenter les transformations clés du sprint.",
    projectId: "crm-prj-002",
    sprintId: "crm-sprint-002",
    assigneeId: "usr-205",
    status: "review",
    priority: "High",
    dueDate: "2024-02-20T00:00:00Z",
    createdAt: "2024-02-18T16:15:00Z",
    order: 1,
  },
  {
    id: "crm-task-005",
    title: "Validation des jobs nocturnes",
    description: "S'assurer de la conformité des jobs planifiés.",
    projectId: "crm-prj-002",
    sprintId: "crm-sprint-002",
    assigneeId: "usr-203",
    status: "todo",
    priority: "Medium",
    dueDate: "2024-02-27T00:00:00Z",
    createdAt: "2024-02-20T07:20:00Z",
    order: 2,
  },
  {
    id: "crm-task-006",
    title: "Mise à jour du socle de sécurité",
    description: "Appliquer les recommandations audit cloud.",
    projectId: "crm-prj-004",
    sprintId: "crm-sprint-002",
    assigneeId: "usr-204",
    status: "review",
    priority: "High",
    dueDate: "2024-02-22T00:00:00Z",
    createdAt: "2024-02-17T15:00:00Z",
    order: 2,
  },
  {
    id: "crm-task-007",
    title: "Playbook assistance IA",
    description: "Documenter les scénarios d'escalade.",
    projectId: "crm-prj-004",
    sprintId: "crm-sprint-002",
    assigneeId: "usr-202",
    status: "done",
    priority: "Low",
    dueDate: "2024-02-16T00:00:00Z",
    createdAt: "2024-02-14T10:42:00Z",
    order: 1,
  },
  {
    id: "crm-task-008",
    title: "Workshops d'acculturation IA",
    description: "Sensibiliser les équipes support.",
    projectId: "crm-prj-004",
    sprintId: "crm-sprint-001",
    assigneeId: "usr-202",
    status: "done",
    priority: "Medium",
    dueDate: "2024-02-09T00:00:00Z",
    createdAt: "2024-02-05T13:10:00Z",
    order: 1,
  },
  {
    id: "crm-task-009",
    title: "Cartographie des données produit",
    description: "Lister les tables prioritaires.",
    projectId: "crm-prj-002",
    sprintId: "crm-sprint-001",
    assigneeId: "usr-205",
    status: "done",
    priority: "High",
    dueDate: "2024-02-12T00:00:00Z",
    createdAt: "2024-02-07T08:00:00Z",
    order: 1,
  },
  {
    id: "crm-task-010",
    title: "Revue UX parcours assistance",
    description: "Collecter les retours utilisateurs.",
    projectId: "crm-prj-001",
    sprintId: "crm-sprint-003",
    assigneeId: "usr-201",
    status: "todo",
    priority: "Medium",
    dueDate: "2024-03-06T00:00:00Z",
    createdAt: "2024-02-22T08:55:00Z",
    order: 1,
  },
];
