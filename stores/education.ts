import { reactive, ref, watch } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "~/lib/pinia-shim";
import { educationCategoriesMock } from "~/lib/mock/education";
import type {
  CategorySummary,
  Certificate,
  Course,
  CourseProgress,
  Exercise,
  Lesson,
  QuizQuestion,
} from "~/types/education";

const STORAGE_KEY = "bro-world-education";

interface PersistedState {
  progress: Record<string, CourseProgress>;
  certificates: Certificate[];
}

function createInitialPersistedState(): PersistedState {
  return {
    progress: {},
    certificates: [],
  };
}

export const useEducationStore = defineStore("education", () => {
  const categories = ref<CategorySummary[]>([]);
  const courses = ref<Course[]>([]);
  const lessons = reactive<Record<string, Lesson[]>>({});
  const exercises = reactive<Record<string, Exercise[]>>({});
  const quiz = reactive<Record<string, QuizQuestion[]>>({});
  const progress = reactive<Record<string, CourseProgress>>({});
  const certificates = ref<Certificate[]>([]);

  if (import.meta.client) {
    const storage = useLocalStorage<PersistedState>(STORAGE_KEY, createInitialPersistedState(), {
      deep: true,
      serializer: {
        read: (value: string): PersistedState => {
          try {
            const parsed = JSON.parse(value) as PersistedState | null;
            if (parsed && typeof parsed === "object") {
              return {
                progress: parsed.progress ?? {},
                certificates: parsed.certificates ?? [],
              };
            }
          } catch {
            // noop
          }
          return createInitialPersistedState();
        },
        write: (value: PersistedState) => JSON.stringify(value),
      },
    });

    Object.assign(progress, storage.value.progress ?? {});
    certificates.value = [...(storage.value.certificates ?? [])];

    watch(
      () => ({
        progress: JSON.parse(JSON.stringify(progress)) as Record<string, CourseProgress>,
        certificates: certificates.value.map((entry) => ({ ...entry })),
      }),
      (value) => {
        storage.value = value;
      },
      { deep: true },
    );
  }

  function upsertCourse(course: Course) {
    const index = courses.value.findIndex((entry) => entry.id === course.id);
    if (index >= 0) {
      const existing = courses.value[index];
      courses.value[index] = {
        ...existing,
        ...course,
        lessons: course.lessons.length ? course.lessons : existing.lessons,
        quiz: course.quiz.length ? course.quiz : existing.quiz,
      };
    } else {
      courses.value.push(course);
    }
  }

  async function fetchCategories() {
    try {
      const response = await $fetch<CategorySummary[]>("/api/education/categories");
      categories.value = response;
    } catch (error) {
      if (import.meta.dev) {
        console.warn("Failed to fetch education categories, falling back to mock data.", error);
      }

      categories.value = educationCategoriesMock.map((category) => ({ ...category }));
    }
  }

  async function fetchCoursesByCategory(categorySlug: string) {
    const response = await $fetch<Course[]>(`/api/education/courses?category=${categorySlug}`);
    response.forEach(upsertCourse);
  }

  async function fetchCourseDetails(slug: string) {
    const course = await $fetch<Course>(`/api/education/courses/${slug}`);
    upsertCourse(course);
    lessons[slug] = course.lessons;
    quiz[slug] = course.quiz;
  }

  async function fetchLessons(slug: string) {
    const response = await $fetch<Lesson[]>(`/api/education/courses/${slug}/lessons`);
    lessons[slug] = response;
  }

  async function fetchExercises(slug: string) {
    const response = await $fetch<Exercise[]>(`/api/education/courses/${slug}/exercises`);
    exercises[slug] = response;
  }

  async function fetchQuiz(slug: string) {
    const response = await $fetch<QuizQuestion[]>(`/api/education/courses/${slug}/quiz`);
    quiz[slug] = response;
  }

  function ensureProgress(courseId: string): CourseProgress {
    if (!progress[courseId]) {
      progress[courseId] = { lessonDone: {}, exerciseScore: {} };
    }
    return progress[courseId];
  }

  function markLessonDone(courseId: string, lessonId: string) {
    const entry = ensureProgress(courseId);
    entry.lessonDone[lessonId] = true;
  }

  function setExerciseResult(courseId: string, exerciseId: string, correct: boolean) {
    const entry = ensureProgress(courseId);
    entry.exerciseScore[exerciseId] = { answered: true, correct };
  }

  function setQuizScore(courseId: string, correct: number, total: number, passed: boolean) {
    const entry = ensureProgress(courseId);
    entry.quizScore = { correct, total, passed };
  }

  function addCertificate(certificate: Certificate) {
    const index = certificates.value.findIndex((entry) => entry.id === certificate.id);
    if (index >= 0) {
      certificates.value.splice(index, 1, certificate);
    } else {
      certificates.value.unshift(certificate);
    }

    const entry = ensureProgress(certificate.courseId);
    entry.certificateId = certificate.id;
  }

  function resetCourseProgress(courseId: string) {
    if (progress[courseId]) {
      progress[courseId] = { lessonDone: {}, exerciseScore: {} };
    }
  }

  function clearQuizScore(courseId: string) {
    const entry = progress[courseId];
    if (entry) {
      delete entry.quizScore;
      delete entry.certificateId;
    }
  }

  const getCourseBySlug = (slug: string) => courses.value.find((course) => course.slug === slug);
  const getCourseLessons = (slug: string) => lessons[slug] ?? [];
  const getCourseExercises = (slug: string) => exercises[slug] ?? [];
  const getCourseQuiz = (slug: string) => quiz[slug] ?? [];
  const getProgressForCourse = (courseId: string) => progress[courseId];

  return {
    categories,
    courses,
    lessons,
    exercises,
    quiz,
    progress,
    certificates,
    fetchCategories,
    fetchCoursesByCategory,
    fetchCourseDetails,
    fetchLessons,
    fetchExercises,
    fetchQuiz,
    markLessonDone,
    setExerciseResult,
    setQuizScore,
    addCertificate,
    resetCourseProgress,
    clearQuizScore,
    getCourseBySlug,
    getCourseLessons,
    getCourseExercises,
    getCourseQuiz,
    getProgressForCourse,
  };
});
