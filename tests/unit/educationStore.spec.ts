import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { ref } from "vue";
import { createPinia, setActivePinia } from "~/lib/pinia-shim";
import { useEducationStore } from "~/stores/education";
import { educationCategoriesMock } from "~/lib/mock/education";
import type { Certificate } from "~/types/education";

const SAMPLE_COURSE = {
  id: "course-1",
  slug: "sample-course",
  categorySlug: "web",
  title: "Sample Course",
  level: "beginner" as const,
  durationMin: 60,
  description: "",
  cover: "",
  lessons: [],
  quiz: [],
};

describe("education store", () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const localeRef = ref("en");
    vi.stubGlobal("useI18n", () => ({ locale: localeRef }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches categories from the education API", async () => {
    const store = useEducationStore();
    const categories = [
      {
        id: "cat-1",
        slug: "web",
        title: "Web Development",
        description: "Learn how to build for the web.",
        cover: "/img/web.png",
        courseCount: 5,
      },
    ];
    const fetchMock = vi.fn().mockResolvedValueOnce(categories);
    vi.stubGlobal("$fetch", fetchMock);

    await store.fetchCategories();

    expect(fetchMock).toHaveBeenCalledWith("/api/education/categories", {
      query: { locale: "en" },
    });
    expect(store.categories.value).toEqual(categories);
  });

  it("falls back to mock categories when the API request fails", async () => {
    const store = useEducationStore();
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error("Network error"));
    vi.stubGlobal("$fetch", fetchMock);

    await store.fetchCategories();

    expect(fetchMock).toHaveBeenCalledWith("/api/education/categories", {
      query: { locale: "en" },
    });
    expect(store.categories.value).toEqual(educationCategoriesMock);
  });

  it("marks lessons and exercises", () => {
    const store = useEducationStore();
    store.courses.value.push(SAMPLE_COURSE);

    store.markLessonDone(SAMPLE_COURSE.id, "lesson-1");
    store.setExerciseResult(SAMPLE_COURSE.id, "exercise-1", true);

    expect(store.progress[SAMPLE_COURSE.id]).toBeDefined();
    expect(store.progress[SAMPLE_COURSE.id].lessonDone["lesson-1"]).toBe(true);
    expect(store.progress[SAMPLE_COURSE.id].exerciseScore["exercise-1"]).toEqual({
      answered: true,
      correct: true,
    });
  });

  it("records quiz scores and certificates", () => {
    const store = useEducationStore();
    store.courses.value.push(SAMPLE_COURSE);

    store.setQuizScore(SAMPLE_COURSE.id, 7, 10, true);

    expect(store.progress[SAMPLE_COURSE.id].quizScore).toEqual({
      correct: 7,
      total: 10,
      passed: true,
    });

    const certificate: Certificate = {
      id: "cert-1",
      courseId: SAMPLE_COURSE.id,
      courseTitle: "Sample Course",
      userName: "Learner",
      score: 80,
      dateIso: new Date().toISOString(),
    };

    store.addCertificate(certificate);

    expect(store.certificates.value[0]).toEqual(certificate);
    expect(store.progress[SAMPLE_COURSE.id].certificateId).toBe("cert-1");
  });

  it("clears quiz results without resetting lessons", () => {
    const store = useEducationStore();
    store.courses.value.push(SAMPLE_COURSE);

    store.markLessonDone(SAMPLE_COURSE.id, "lesson-1");
    store.setQuizScore(SAMPLE_COURSE.id, 6, 10, false);

    store.clearQuizScore(SAMPLE_COURSE.id);

    expect(store.progress[SAMPLE_COURSE.id].lessonDone["lesson-1"]).toBe(true);
    expect(store.progress[SAMPLE_COURSE.id].quizScore).toBeUndefined();
    expect(store.progress[SAMPLE_COURSE.id].certificateId).toBeUndefined();
  });
});
