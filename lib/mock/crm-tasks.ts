export interface CrmTaskMockEntry {
  id: string;
  projectId: string;
  name: string;
  brief: string;
  description: string;
  startDate: string;
  finishDate: string;
  status: "todo" | "in-progress" | "completed";
  createdAt: string;
  updatedAt: string;
}

export const crmTasksMock: CrmTaskMockEntry[] = [
  {
    id: "task-001",
    projectId: "prj-001",
    name: "Atelier de cadrage UX",
    brief: "Clarifier les parcours clés et définir les personas prioritaires.",
    description:
      "Organisation d'une série d'ateliers avec les équipes produit et support afin d'identifier les irritants actuels et de cartographier les opportunités d'amélioration.",
    startDate: "2024-01-08T00:00:00Z",
    finishDate: "2024-01-19T00:00:00Z",
    status: "completed",
    createdAt: "2024-01-02T09:30:00Z",
    updatedAt: "2024-01-20T17:45:00Z",
  },
  {
    id: "task-002",
    projectId: "prj-001",
    name: "Prototype du parcours d'inscription",
    brief: "Valider le nouveau flux avec un panel de clients pilotes.",
    description:
      "Création d'un prototype haute fidélité avec tests utilisateurs ciblés sur la simplification de l'inscription et l'onboarding.",
    startDate: "2024-02-05T00:00:00Z",
    finishDate: "2024-02-23T00:00:00Z",
    status: "in-progress",
    createdAt: "2024-01-26T14:10:00Z",
    updatedAt: "2024-02-15T10:25:00Z",
  },
  {
    id: "task-003",
    projectId: "prj-002",
    name: "Modélisation des flux de données",
    brief: "Cartographier les sources et définir les transformations clés.",
    description:
      "Compilation de l'ensemble des flux entrants, définition des règles de qualité et préparation du backlog technique pour l'équipe data.",
    startDate: "2024-02-19T00:00:00Z",
    finishDate: "2024-03-08T00:00:00Z",
    status: "todo",
    createdAt: "2024-02-12T11:15:00Z",
    updatedAt: "2024-02-12T11:15:00Z",
  },
  {
    id: "task-004",
    projectId: "prj-003",
    name: "Audit de l'infrastructure existante",
    brief: "Identifier les dépendances critiques avant migration.",
    description:
      "Analyse détaillée des workloads et définition des étapes de migration en coordination avec les équipes sécurité et réseau.",
    startDate: "2023-09-04T00:00:00Z",
    finishDate: "2023-10-06T00:00:00Z",
    status: "completed",
    createdAt: "2023-08-25T08:20:00Z",
    updatedAt: "2023-10-08T18:55:00Z",
  },
  {
    id: "task-005",
    projectId: "prj-003",
    name: "Mise en place du landing zone cloud",
    brief: "Configurer la base d'architecture cloud et les politiques de sécurité.",
    description:
      "Déploiement de l'infrastructure de référence, configuration des comptes et automatisation des déploiements via IaC.",
    startDate: "2023-11-13T00:00:00Z",
    finishDate: "2024-02-02T00:00:00Z",
    status: "in-progress",
    createdAt: "2023-11-01T13:40:00Z",
    updatedAt: "2024-01-28T09:05:00Z",
  },
];
