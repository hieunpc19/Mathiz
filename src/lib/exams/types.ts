export type QuestionType = "single_choice" | "multiple_choice" | "fill_blank";

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  position: number;
  code: string;
  type: QuestionType;
  points: number;
  category: string;
  bodyMd: string;
  options: QuestionOption[];
}

export interface ExamSummary {
  id: string;
  title: string;
  subtitle: string;
  competition: string;
  grade: number;
  gradeMin: number;
  gradeMax: number;
  gradeLabel: string;
  durationMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  difficulty: string;
  description: string;
  status: "draft" | "published" | "archived";
}

export interface ExamDetail extends ExamSummary {
  round: string | null;
  schoolYear: string | null;
  languages: string[];
  rules: string[];
}

export interface AttemptExam extends ExamDetail {
  questions: ExamQuestion[];
}

export interface AttemptData {
  id: string;
  status: "in_progress" | "submitted" | "graded" | "abandoned";
  startedAt: string;
  deadlineAt: string | null;
  answers: Record<string, string>;
  exam: AttemptExam;
}

export interface ResultQuestion extends ExamQuestion {
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  awardedPoints: number;
  explanationMd: string;
}

export interface AttemptResult {
  attemptId: string;
  status: string;
  submittedAt: string;
  score: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  exam: ExamDetail;
  questions: ResultQuestion[];
}
