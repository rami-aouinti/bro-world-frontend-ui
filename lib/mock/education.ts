import type { CategorySummary } from "~/types/education";

export const educationCategoriesMock: CategorySummary[] = [
  {
    id: "cat-web",
    slug: "web-dev",
    title: "Web Development",
    description: "Modern frameworks for building web applications.",
    cover: "/img/cat-web.jpg",
    courseCount: 2,
  },
  {
    id: "cat-data",
    slug: "data-science",
    title: "Data Science",
    description: "Data analysis, modelling, and storytelling.",
    cover: "/img/cat-data.jpg",
    courseCount: 1,
  },
  {
    id: "cat-product",
    slug: "product-leadership",
    title: "Product Leadership",
    description: "Frameworks to align product, design, and operations.",
    cover: "/img/cat-product.jpg",
    courseCount: 1,
  },
];
