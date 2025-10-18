export interface CrmRequestMockEntry {
  id: string;
  projectId: string;
  requesterId: string;
  requesterName: string;
  role: string;
  message: string;
  status: "pending" | "approved" | "declined";
  submittedAt: string;
}

export const crmRequestsMock: CrmRequestMockEntry[] = [
  {
    id: "prj-001-req-001",
    projectId: "prj-001",
    requesterId: "usr-208",
    requesterName: "Camille Durand",
    role: "QA Analyst",
    message:
      "Je souhaiterais rejoindre le projet pour accompagner la mise en place des tests end-to-end.",
    status: "pending",
    submittedAt: "2024-02-18T14:20:00Z",
  },
  {
    id: "prj-001-req-002",
    projectId: "prj-001",
    requesterId: "usr-209",
    requesterName: "Julien Robert",
    role: "Développeur front",
    message:
      "Disponible pour intervenir sur la refonte du portail client avec expertise Vue/Vuetify.",
    status: "approved",
    submittedAt: "2024-01-30T09:05:00Z",
  },
  {
    id: "prj-002-req-001",
    projectId: "prj-002",
    requesterId: "usr-210",
    requesterName: "Marie Leroy",
    role: "Data Analyst",
    message: "J'aimerais soutenir l'équipe data pour préparer les modèles de reporting financiers.",
    status: "pending",
    submittedAt: "2024-02-22T11:45:00Z",
  },
  {
    id: "prj-003-req-001",
    projectId: "prj-003",
    requesterId: "usr-211",
    requesterName: "Thomas Borel",
    role: "DevOps Engineer",
    message: "Je peux couvrir les pipelines CI/CD pendant la migration vers le cloud.",
    status: "declined",
    submittedAt: "2023-12-14T16:30:00Z",
  },
];
