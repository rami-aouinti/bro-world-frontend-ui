import { persistedState } from "pinia-plugin-persistedstate";
import { computed, reactive, ref, watch } from "vue";
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

export const useEducationStore = defineStore("education", () => {
  const categories = ref<CategorySummary[]>([]);
  const courses = ref<Course[]>([]);
  const lessons = reactive<Record<string, Lesson[]>>({});
  const exercises = reactive<Record<string, Exercise[]>>({});
  const quiz = reactive<Record<string, QuizQuestion[]>>({});
  const progress = ref<Record<string, CourseProgress>>({});
  const certificates = ref<Certificate[]>([]);
  const { locale } = useI18n();
  const currentLocale = computed(() => locale.value);
  const fetchedCategorySlugs = new Set<string>();
  const fetchedCourseSlugs = new Set<string>();
  const fetchedLessonsSlugs = new Set<string>();
  const fetchedExercisesSlugs = new Set<string>();
  const fetchedQuizSlugs = new Set<string>();

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
      const response = await $fetch<CategorySummary[]>("/api/education/categories", {
        query: { locale: currentLocale.value },
      });
      categories.value = response;
    } catch (error) {
      if (import.meta.dev) {
        console.warn("Failed to fetch education categories, falling back to mock data.", error);
      }

      categories.value = educationCategoriesMock.map((category) => ({ ...category }));
    }
  }

  async function fetchCoursesByCategory(categorySlug: string) {
    const response = await $fetch<Course[]>("/api/education/courses", {
      query: { category: categorySlug, locale: currentLocale.value },
    });
    response.forEach(upsertCourse);
    fetchedCategorySlugs.add(categorySlug);
  }

  async function fetchCourseDetails(slug: string) {
    const course = await $fetch<Course>(`/api/education/courses/${slug}`, {
      query: { locale: currentLocale.value },
    });
    upsertCourse(course);
    lessons[slug] = course.lessons;
    quiz[slug] = course.quiz;
    fetchedCourseSlugs.add(slug);
  }

  async function fetchLessons(slug: string) {
    const response = await $fetch<Lesson[]>(`/api/education/courses/${slug}/lessons`, {
      query: { locale: currentLocale.value },
    });
    lessons[slug] = response;
    fetchedLessonsSlugs.add(slug);
  }

  async function fetchExercises(slug: string) {
    const response = await $fetch<Exercise[]>(`/api/education/courses/${slug}/exercises`, {
      query: { locale: currentLocale.value },
    });
    exercises[slug] = response;
    fetchedExercisesSlugs.add(slug);
  }

  async function fetchQuiz(slug: string) {
    const response = await $fetch<QuizQuestion[]>(`/api/education/courses/${slug}/quiz`, {
      query: { locale: currentLocale.value },
    });
    quiz[slug] = response;
    fetchedQuizSlugs.add(slug);
  }

  function ensureProgress(courseId: string): CourseProgress {
    if (!progress.value[courseId]) {
      progress.value[courseId] = { lessonDone: {}, exerciseScore: {} };
    }
    return progress.value[courseId];
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
    if (progress.value[courseId]) {
      progress.value[courseId] = { lessonDone: {}, exerciseScore: {} };
    }
  }

  function clearQuizScore(courseId: string) {
    const entry = progress.value[courseId];
    if (entry) {
      delete entry.quizScore;
      delete entry.certificateId;
    }
  }

  function getCourseBySlug(slug: string) {
    return courses.value.find((course) => course.slug === slug);
  }

  function getCourseLessons(slug: string) {
    return lessons[slug] ?? [];
  }

  function getCourseExercises(slug: string) {
    return exercises[slug] ?? [];
  }

  function getCourseQuiz(slug: string) {
    return quiz[slug] ?? [];
  }

  function getProgressForCourse(courseId: string) {
    return progress.value[courseId];
  }

  watch(
    currentLocale,
    () => {
      categories.value = [];
      courses.value = [];
      Object.keys(lessons).forEach((key) => delete lessons[key]);
      Object.keys(exercises).forEach((key) => delete exercises[key]);
      Object.keys(quiz).forEach((key) => delete quiz[key]);

      if (import.meta.client) {
        void fetchCategories();
        fetchedCategorySlugs.forEach((slug) => {
          void fetchCoursesByCategory(slug);
        });
        fetchedCourseSlugs.forEach((slug) => {
          void fetchCourseDetails(slug);
        });
        fetchedLessonsSlugs.forEach((slug) => {
          if (!fetchedCourseSlugs.has(slug)) {
            void fetchLessons(slug);
          }
        });
        fetchedExercisesSlugs.forEach((slug) => {
          void fetchExercises(slug);
        });
        fetchedQuizSlugs.forEach((slug) => {
          if (!fetchedCourseSlugs.has(slug)) {
            void fetchQuiz(slug);
          }
        });
      }
    },
    { flush: "post" },
  );

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
}, {
  persist: {
    key: STORAGE_KEY,
    storage: persistedState.localStorage,
    paths: ["progress", "certificates"],
  },
});
