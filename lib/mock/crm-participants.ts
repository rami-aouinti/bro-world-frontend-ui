export interface CrmParticipantMockEntry {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  tasksCount: number;
  joinedAt: string;
}

export const crmParticipantsMock: CrmParticipantMockEntry[] = [
  {
    id: "prj-001-part-001",
    projectId: "prj-001",
    userId: "usr-201",
    name: "Alexandre Fournier",
    role: "Chef de projet",
    email: "alexandre.fournier@example.com",
    phone: "+33 6 12 34 56 70",
    tasksCount: 0,
    joinedAt: "2023-12-04T08:45:00Z",
  },
  {
    id: "prj-001-part-002",
    projectId: "prj-001",
    userId: "usr-202",
    name: "Léa Gauthier",
    role: "UX Designer",
    email: "lea.gauthier@example.com",
    tasksCount: 4,
    joinedAt: "2023-12-11T10:12:00Z",
  },
  {
    id: "prj-001-part-003",
    projectId: "prj-001",
    userId: "usr-101",
    name: "Mélanie Dupont",
    role: "Account Manager",
    email: "melanie.dupont@example.com",
    tasksCount: 2,
    joinedAt: "2023-11-15T09:20:00Z",
  },
  {
    id: "prj-002-part-001",
    projectId: "prj-002",
    userId: "usr-201",
    name: "Alexandre Fournier",
    role: "Chef de projet",
    email: "alexandre.fournier@example.com",
    phone: "+33 6 12 34 56 70",
    tasksCount: 1,
    joinedAt: "2024-02-12T08:00:00Z",
  },
  {
    id: "prj-002-part-002",
    projectId: "prj-002",
    userId: "usr-204",
    name: "Martin Leroy",
    role: "Data Engineer",
    email: "martin.leroy@example.com",
    tasksCount: 3,
    joinedAt: "2024-02-15T13:30:00Z",
  },
  {
    id: "prj-003-part-001",
    projectId: "prj-003",
    userId: "usr-205",
    name: "Sophie Martins",
    role: "Cloud Architect",
    email: "sophie.martins@example.com",
    tasksCount: 5,
    joinedAt: "2023-08-23T11:40:00Z",
  },
  {
    id: "prj-003-part-002",
    projectId: "prj-003",
    userId: "usr-201",
    name: "Alexandre Fournier",
    role: "Chef de projet",
    email: "alexandre.fournier@example.com",
    phone: "+33 6 12 34 56 70",
    tasksCount: 2,
    joinedAt: "2023-08-29T09:15:00Z",
  },
  {
    id: "prj-004-part-001",
    projectId: "prj-004",
    userId: "usr-206",
    name: "Inès Rahmani",
    role: "Product Owner",
    email: "ines.rahmani@example.com",
    tasksCount: 0,
    joinedAt: "2023-03-02T15:55:00Z",
  },
  {
    id: "prj-005-part-001",
    projectId: "prj-005",
    userId: "usr-207",
    name: "Diego Fernández",
    role: "Support Lead",
    email: "diego.fernandez@example.com",
    tasksCount: 6,
    joinedAt: "2023-09-15T10:05:00Z",
  },
  {
    id: "prj-005-part-002",
    projectId: "prj-005",
    userId: "usr-201",
    name: "Alexandre Fournier",
    role: "Chef de projet",
    email: "alexandre.fournier@example.com",
    phone: "+33 6 12 34 56 70",
    tasksCount: 1,
    joinedAt: "2023-10-01T08:25:00Z",
  },
];
