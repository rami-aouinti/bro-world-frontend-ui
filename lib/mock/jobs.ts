import type { JobSummary } from "~/stores/useJobStore";

type JobLanguage = {
  name: string;
  level?: string;
};

type JobCompany = {
  id: string;
  name: string;
};

export const jobCompaniesSample: JobCompany[] = [
  {
    id: "novatech-labs",
    name: "NovaTech Labs",
  },
  {
    id: "atelier-donnees",
    name: "Atelier des Données",
  },
  {
    id: "collectif-creatif",
    name: "Collectif Créatif",
  },
];

export const jobListSample: JobSummary[] = [
  {
    id: "mock-job-1",
    title: "Développeur·se Full Stack Vue.js",
    company: {
      name: "NovaTech Labs",
      description: "Scale-up européenne qui construit des plateformes cloud sécurisées.",
    },
    workLocation: "Paris, France (hybride)",
    salaryRange: "55 000 € - 65 000 €",
    workType: "Temps plein",
    work: "Concevoir et développer de nouvelles fonctionnalités pour notre plateforme SaaS.",
    domain: "SaaS",
    experience: "3+ ans",
    contractType: "CDI",
    skills: ["Vue.js", "TypeScript", "Node.js", "PostgreSQL"],
    languages: [
      { name: "Français", level: "C1" } satisfies JobLanguage,
      { name: "Anglais", level: "B2" } satisfies JobLanguage,
    ],
    description:
      "Vous rejoindrez une équipe produit pluridisciplinaire pour imaginer et livrer des expériences utilisateurs performantes.",
    requirements: [
      "Maîtrise de l'écosystème Vue 3 et de Pinia",
      "Expérience avec les API REST et GraphQL",
      "Connaissance des architectures cloud (AWS ou GCP)",
    ],
    benefits: [
      "Budget formation annuel",
      "Télétravail 3 jours/semaine",
      "Mutuelle premium prise en charge à 80%",
    ],
  },
  {
    id: "mock-job-2",
    title: "Product Designer Senior",
    company: {
      name: "Atelier des Données",
      description: "Entreprise innovante spécialisée dans la visualisation data.",
    },
    workLocation: "Lyon, France (remote friendly)",
    salaryRange: "48 000 € - 58 000 €",
    workType: "Temps plein",
    work: "Collaborer avec les équipes produit et data pour concevoir des interfaces accessibles.",
    domain: "DataViz",
    experience: "5+ ans",
    contractType: "CDI",
    skills: ["UX Research", "Design Systems", "Figma", "Accessibility"],
    languages: [
      { name: "Français", level: "C1" } satisfies JobLanguage,
      { name: "Anglais", level: "B1" } satisfies JobLanguage,
    ],
    description:
      "Vous serez responsable de l'expérience utilisateur globale des produits internes et clients.",
    requirements: [
      "Solide expérience en design produit",
      "Capacité à prototyper et tester rapidement",
      "Culture data et intérêt pour l'inclusion",
    ],
    benefits: [
      "Jours dédiés à la veille et l'expérimentation",
      "Matériel haut de gamme",
      "Participation aux bénéfices",
    ],
  },
  {
    id: "mock-job-3",
    title: "Chef·fe de projet digital",
    company: {
      name: "Collectif Créatif",
      description: "Agence digitale indépendante au service des associations.",
    },
    workLocation: "Bordeaux, France",
    salaryRange: "42 000 € - 50 000 €",
    workType: "Temps plein",
    work: "Piloter la livraison de sites et applications pour nos clients associatifs.",
    domain: "Agence",
    experience: "4+ ans",
    contractType: "CDI",
    skills: ["Gestion de projet", "Agile", "Notion", "Communication"],
    languages: [
      { name: "Français", level: "C2" } satisfies JobLanguage,
      { name: "Anglais", level: "B2" } satisfies JobLanguage,
    ],
    description:
      "Vous coordonnerez des équipes pluridisciplinaires pour garantir la réussite des projets numériques.",
    requirements: [
      "Expérience confirmée en gestion de projet digital",
      "Compétences en facilitation d'ateliers",
      "Connaissance des outils collaboratifs",
    ],
    benefits: [
      "2 jours de télétravail garantis",
      "Chèques vacances",
      "Programme de mentorat interne",
    ],
  },
];
