import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
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
import { educationTranslationsByLocale } from "~/server/mock/education-translations";

interface RawCourse extends Course {
  exercises?: ExerciseWithCourse[];
}

interface EducationData {
  categories: Category[];
  courses: RawCourse[];
  exercises: ExerciseWithCourse[];
}

let baseCache: EducationData | null = null;
const localizedCache = new Map<string, EducationData>();
const certificateStore: Certificate[] = [];

async function readBaseEducationData(): Promise<EducationData> {
  if (baseCache) {
    return baseCache;
  }

  const filePath = join(process.cwd(), "server/mock/education.json");
  const content = await readFile(filePath, "utf8");
  const parsed = JSON.parse(content) as EducationData;

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

  baseCache = parsed;
  return parsed;
}

function cloneEducationData(data: EducationData): EducationData {
  return {
    categories: data.categories.map((category) => ({ ...category })),
    courses: data.courses.map((course) => ({
      ...course,
      lessons: course.lessons.map((lesson) => ({ ...lesson })),
      quiz: course.quiz.map((question) => ({
        ...question,
        options: question.options.map((option) => ({ ...option })),
      })),
      exercises: course.exercises?.map((exercise) => ({ ...exercise })) ?? [],
    })),
    exercises: data.exercises.map((exercise) => ({
      ...exercise,
      options: exercise.options?.map((option) => ({ ...option })),
    })),
  };
}

function applyEducationTranslations(data: EducationData, locale: string): EducationData {
  const normalizedLocale = locale || "en";
  const translations =
    normalizedLocale === "fr"
      ? educationTranslationsByLocale.fr
      : educationTranslationsByLocale[normalizedLocale] ?? educationTranslationsByLocale.en;

  const cloned = cloneEducationData(data);

  if (!translations) {
    return cloned;
  }

  if (translations.categories) {
    cloned.categories = cloned.categories.map((category) => ({
      ...category,
      ...translations.categories?.[category.id],
    }));
  }

  if (translations.courses) {
    cloned.courses = cloned.courses.map((course) => {
      const overrides = translations.courses?.[course.id];
      if (!overrides) {
        return course;
      }

      const updatedCourse: RawCourse = { ...course };

      if (overrides.title) {
        updatedCourse.title = overrides.title;
      }

      if (overrides.description) {
        updatedCourse.description = overrides.description;
      }

      if (overrides.lessons) {
        updatedCourse.lessons = course.lessons.map((lesson) => ({
          ...lesson,
          ...overrides.lessons?.[lesson.id],
        }));
      }

      if (overrides.quiz) {
        updatedCourse.quiz = course.quiz.map((question) => {
          const questionOverrides = overrides.quiz?.[question.id];
          if (!questionOverrides) {
            return { ...question };
          }

          return {
            ...question,
            ...(questionOverrides.question ? { question: questionOverrides.question } : {}),
            options: question.options.map((option) => ({
              ...option,
              ...(questionOverrides.options?.[option.key]
                ? { label: questionOverrides.options[option.key]! }
                : {}),
            })),
          };
        });
      }

      return updatedCourse;
    });
  }

  if (translations.exercises) {
    cloned.exercises = cloned.exercises.map((exercise) => {
      const overrides = translations.exercises?.[exercise.id];
      if (!overrides) {
        return exercise;
      }

      return {
        ...exercise,
        ...(overrides.question ? { question: overrides.question } : {}),
        options: exercise.options?.map((option) => ({
          ...option,
          ...(overrides.options?.[option.key]
            ? { label: overrides.options[option.key]! }
            : {}),
        })),
      };
    });
  }

  return cloned;
}

async function readEducationData(locale?: string): Promise<EducationData> {
  const normalizedLocale = locale && typeof locale === "string" ? locale : "en";
  const cached = localizedCache.get(normalizedLocale);

  if (cached) {
    return cached;
  }

  const baseData = await readBaseEducationData();
  const localized = applyEducationTranslations(baseData, normalizedLocale);
  localizedCache.set(normalizedLocale, localized);
  return localized;
}

export async function listCategories(locale?: string): Promise<CategorySummary[]> {
  const data = await readEducationData(locale);
  return data.categories.map((category) => ({
    ...category,
    courseCount: data.courses.filter((course) => course.categorySlug === category.slug).length,
  }));
}

export async function listCourses(categorySlug?: string, locale?: string): Promise<Course[]> {
  const data = await readEducationData(locale);
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

export async function getCourse(slug: string, locale?: string): Promise<Course | null> {
  const data = await readEducationData(locale);
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

export async function getCourseLessons(slug: string, locale?: string): Promise<Lesson[]> {
  const course = await getRawCourse(slug, locale);
  return course?.lessons ?? [];
}

export async function getCourseExercises(slug: string, locale?: string): Promise<Exercise[]> {
  const course = await getRawCourse(slug, locale);
  return (course?.exercises ?? []).map(({ courseId, ...exercise }) => exercise);
}

export async function getCourseQuiz(slug: string, locale?: string): Promise<QuizQuestion[]> {
  const course = await getRawCourse(slug, locale);
  return course?.quiz ?? [];
}

async function getRawCourse(slug: string, locale?: string): Promise<RawCourse | null> {
  const data = await readEducationData(locale);
  return data.courses.find((course) => course.slug === slug) ?? null;
}

export async function evaluateQuiz(
  courseId: string,
  answers: Record<string, string>,
  locale?: string,
): Promise<{ correct: number; total: number; passed: boolean; threshold: number }> {
  const data = await readEducationData(locale);
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
  locale?: string,
): Promise<Certificate> {
  const data = await readEducationData(locale);
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
  baseCache = null;
  localizedCache.clear();
  certificateStore.splice(0, certificateStore.length);
}
