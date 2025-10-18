import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { createError } from "h3";
import type {
  Category,
  CategorySummary,
  Certificate,
  Course,
  Exercise,
  ExerciseWithCourse,
  Lesson,
  QuizQuestion,
} from "~/types/education";

interface RawCourse extends Course {
  exercises?: ExerciseWithCourse[];
}

interface EducationData {
  categories: Category[];
  courses: RawCourse[];
  exercises: ExerciseWithCourse[];
}

let cache: EducationData | null = null;
const certificateStore: Certificate[] = [];

async function readEducationData(): Promise<EducationData> {
  if (cache) {
    return cache;
  }

  const filePath = join(process.cwd(), "server/mock/education.json");
  const content = await readFile(filePath, "utf8");
  const parsed = JSON.parse(content) as EducationData;

  // ensure exercises mapped to courses
  const exercisesByCourse: Record<string, ExerciseWithCourse[]> = {};
  for (const exercise of parsed.exercises ?? []) {
    exercisesByCourse[exercise.courseId] ||= [];
    exercisesByCourse[exercise.courseId]!.push(exercise);
  }

  parsed.courses = parsed.courses.map((course) => ({
    ...course,
    lessons: course.lessons ?? [],
    quiz: course.quiz ?? [],
    exercises: exercisesByCourse[course.id] ?? [],
  }));

  cache = parsed;
  return parsed;
}

export async function listCategories(): Promise<CategorySummary[]> {
  const data = await readEducationData();
  return data.categories.map((category) => ({
    ...category,
    courseCount: data.courses.filter((course) => course.categorySlug === category.slug).length,
  }));
}

export async function listCourses(categorySlug?: string): Promise<Course[]> {
  const data = await readEducationData();
  const filtered = categorySlug
    ? data.courses.filter((course) => course.categorySlug === categorySlug)
    : data.courses;

  return filtered.map((course) => ({
    id: course.id,
    slug: course.slug,
    categorySlug: course.categorySlug,
    title: course.title,
    level: course.level,
    durationMin: course.durationMin,
    description: course.description,
    cover: course.cover,
    lessons: [],
    quiz: [],
  }));
}

export async function getCourse(slug: string): Promise<Course | null> {
  const data = await readEducationData();
  const course = data.courses.find((entry) => entry.slug === slug);
  if (!course) {
    return null;
  }

  return {
    id: course.id,
    slug: course.slug,
    categorySlug: course.categorySlug,
    title: course.title,
    level: course.level,
    durationMin: course.durationMin,
    description: course.description,
    cover: course.cover,
    lessons: course.lessons,
    quiz: course.quiz,
  };
}

export async function getCourseLessons(slug: string): Promise<Lesson[]> {
  const course = await getRawCourse(slug);
  return course?.lessons ?? [];
}

export async function getCourseExercises(slug: string): Promise<Exercise[]> {
  const course = await getRawCourse(slug);
  return (course?.exercises ?? []).map(({ courseId, ...exercise }) => exercise);
}

export async function getCourseQuiz(slug: string): Promise<QuizQuestion[]> {
  const course = await getRawCourse(slug);
  return course?.quiz ?? [];
}

async function getRawCourse(slug: string): Promise<RawCourse | null> {
  const data = await readEducationData();
  return data.courses.find((course) => course.slug === slug) ?? null;
}

export async function evaluateQuiz(
  courseId: string,
  answers: Record<string, string>,
): Promise<{ correct: number; total: number; passed: boolean; threshold: number }> {
  const data = await readEducationData();
  const course = data.courses.find((entry) => entry.id === courseId);

  if (!course) {
    throw createError({ statusCode: 404, statusMessage: "Course not found" });
  }

  const total = course.quiz.length;
  const correct = course.quiz.reduce((sum, question) => {
    const userAnswer = answers[question.id];
    return sum + (userAnswer && userAnswer === question.correct ? 1 : 0);
  }, 0);

  const threshold = 0.7;
  const passed = total === 0 ? false : correct / total >= threshold;

  return { correct, total, passed, threshold };
}

export async function createCertificate(
  payload: Omit<Certificate, "id" | "courseTitle" | "dateIso"> & { courseTitle?: string },
): Promise<Certificate> {
  const data = await readEducationData();
  const course = data.courses.find((entry) => entry.id === payload.courseId);

  if (!course) {
    throw createError({ statusCode: 404, statusMessage: "Course not found" });
  }

  const certificate: Certificate = {
    id: payload.id ?? `EDU-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
    courseId: course.id,
    courseTitle: course.title,
    userName: payload.userName,
    score: payload.score,
    dateIso: new Date().toISOString(),
  };

  certificateStore.unshift(certificate);
  return certificate;
}

export function listCertificates(): Certificate[] {
  return [...certificateStore];
}

export function findCertificate(id: string): Certificate | null {
  return certificateStore.find((entry) => entry.id === id) ?? null;
}

export function clearEducationCache() {
  cache = null;
  certificateStore.splice(0, certificateStore.length);
}
