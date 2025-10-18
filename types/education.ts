export type Level = "beginner" | "intermediate" | "advanced";

export interface Category {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: string;
}

export interface CategorySummary extends Category {
  courseCount: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: "text" | "video";
  content: string;
  durationMin: number;
}

export interface ExerciseOption {
  key: string;
  label: string;
}

export interface Exercise {
  id: string;
  lessonId: string;
  question: string;
  type: "mcq" | "truefalse";
  options?: ExerciseOption[];
  correct?: string | string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: ExerciseOption[];
  correct: string;
}

export interface Course {
  id: string;
  slug: string;
  categorySlug: string;
  title: string;
  level: Level;
  durationMin: number;
  description: string;
  cover: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
}

export interface ExerciseWithCourse extends Exercise {
  courseId: string;
}

export interface CourseProgress {
  lessonDone: Record<string, boolean>;
  exerciseScore: Record<string, { answered: boolean; correct: boolean }>;
  quizScore?: { correct: number; total: number; passed: boolean };
  certificateId?: string;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  userName: string;
  score: number;
  dateIso: string;
}

export interface CourseCertificatePayload {
  courseId: string;
  userName: string;
  score: number;
}

export interface SubmitQuizPayload {
  courseId: string;
  answers: Record<string, string>;
}

export interface SubmitQuizResult {
  correct: number;
  total: number;
  passed: boolean;
}
