import type { CategorySummary } from "~/types/education";

export const educationCategoriesMock: CategorySummary[] = [
  {
    id: "cat-web",
    slug: "web-dev",
    title: "Développement Web",
    description: "Frameworks modernes pour créer des applications web.",
    cover: "/img/cat-web.jpg",
    courseCount: 2,
  },
  {
    id: "cat-data",
    slug: "data-science",
    title: "Data Science",
    description: "Analyse de données, modèles et storytelling.",
    cover: "/img/cat-data.jpg",
    courseCount: 1,
  },
  {
    id: "cat-product",
    slug: "product-leadership",
    title: "Leadership Produit",
    description: "Cadres pour aligner produit, design et opérations.",
    cover: "/img/cat-product.jpg",
    courseCount: 1,
  },
];
