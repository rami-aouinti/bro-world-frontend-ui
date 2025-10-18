export interface CrmProjectMockEntry {
  id: string;
  name: string;
  description: string;
  status: string;
  stage: string;
  priority: "low" | "medium" | "high";
  pipeline: string;
  ownerId: string;
  ownerName: string;
  clientName: string;
  budget: number;
  probability: number;
  startDate: string;
  dueDate: string;
  finishDate: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export const crmProjectsMock: CrmProjectMockEntry[] = [
  {
    id: "prj-001",
    name: "Refonte du portail client",
    description:
      "Modernisation complète de l'interface client avec un parcours d'inscription repensé et des intégrations CRM.",
    status: "in-progress",
    stage: "Discovery",
    priority: "high",
    pipeline: "Enterprise",
    ownerId: "usr-101",
    ownerName: "Mélanie Dupont",
    clientName: "Nova Solutions",
    budget: 125_000,
    probability: 0.65,
    startDate: "2023-12-05T00:00:00Z",
    dueDate: "2024-04-30T00:00:00Z",
    finishDate: null,
    createdAt: "2023-11-15T09:20:00Z",
    updatedAt: "2024-01-22T07:45:00Z",
    tags: ["refonte", "ux", "priorité"],
  },
  {
    id: "prj-002",
    name: "Déploiement data warehouse",
    description:
      "Conception d'un entrepôt de données unifié pour centraliser les rapports financiers et marketing.",
    status: "planning",
    stage: "Planning",
    priority: "medium",
    pipeline: "Scale-Up",
    ownerId: "usr-108",
    ownerName: "Nassim Belaïd",
    clientName: "Orion Retail",
    budget: 90_000,
    probability: 0.55,
    startDate: "2024-02-12T00:00:00Z",
    dueDate: "2024-07-05T00:00:00Z",
    finishDate: null,
    createdAt: "2024-01-10T12:05:00Z",
    updatedAt: "2024-02-01T15:18:00Z",
    tags: ["data", "bi"],
  },
  {
    id: "prj-003",
    name: "Migration infrastructure cloud",
    description:
      "Transition progressive des services on-premise vers une architecture cloud hybride avec monitoring renforcé.",
    status: "at-risk",
    stage: "Execution",
    priority: "high",
    pipeline: "Enterprise",
    ownerId: "usr-115",
    ownerName: "Sofia Carvalho",
    clientName: "Helios Manufacturing",
    budget: 210_000,
    probability: 0.42,
    startDate: "2023-08-21T00:00:00Z",
    dueDate: "2024-03-18T00:00:00Z",
    finishDate: null,
    createdAt: "2023-07-30T10:00:00Z",
    updatedAt: "2024-01-28T11:32:00Z",
    tags: ["cloud", "migration", "ops"],
  },
  {
    id: "prj-004",
    name: "Programme de fidélité mobile",
    description:
      "Création d'une application mobile multicanal avec campagnes personnalisées et suivi des conversions.",
    status: "completed",
    stage: "Handover",
    priority: "medium",
    pipeline: "Growth",
    ownerId: "usr-103",
    ownerName: "Lina Aït-Kaci",
    clientName: "Cafe Parisien",
    budget: 45_000,
    probability: 0.88,
    startDate: "2023-04-03T00:00:00Z",
    dueDate: "2023-09-22T00:00:00Z",
    finishDate: "2023-09-18T00:00:00Z",
    createdAt: "2023-02-18T08:30:00Z",
    updatedAt: "2023-09-19T16:42:00Z",
    tags: ["mobile", "fidélité"],
  },
  {
    id: "prj-005",
    name: "Automatisation support client",
    description:
      "Déploiement d'un centre de support assisté par IA avec workflows d'escalade et réponses multilingues.",
    status: "in-progress",
    stage: "Execution",
    priority: "high",
    pipeline: "Enterprise",
    ownerId: "usr-119",
    ownerName: "Paul Herrera",
    clientName: "Axis Services",
    budget: 160_000,
    probability: 0.6,
    startDate: "2023-10-09T00:00:00Z",
    dueDate: "2024-05-27T00:00:00Z",
    finishDate: null,
    createdAt: "2023-09-12T14:50:00Z",
    updatedAt: "2024-01-30T09:05:00Z",
    tags: ["automation", "support", "ia"],
  },
];
