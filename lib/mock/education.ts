import type { CategorySummary } from "~/types/education";

export const educationCategoriesMock: CategorySummary[] = [
  {
    id: "cat-web",
    slug: "web-dev",
    title: "Web Development",
    description: "Modern frameworks for building web applications.",
    cover: "/images/education/cat-web.webp",
    courseCount: 2,
  },
  {
    id: "cat-data",
    slug: "data-science",
    title: "Data Science",
    description: "Data analysis, modelling, and storytelling.",
    cover: "/images/education/cat-data.webp",
    courseCount: 1,
  },
  {
    id: "cat-product",
    slug: "product-leadership",
    title: "Product Leadership",
    description: "Frameworks to align product, design, and operations.",
    cover: "/images/education/cat-product.webp",
    courseCount: 1,
  },
];
