export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export interface ExamConfig {
  durationMinutes: number;
  maxAttempts: number;
  showAnswersAfter: boolean;
}

export interface Exam {
  id: string;
  code: string;
  title: string;
  questions: Question[];
  config: ExamConfig;
  createdAt: number;
  active: boolean;
}

export interface StudentSubmission {
  id: string;
  examId: string;
  studentName: string;
  studentClass: string;
  answers: number[]; // Index of selected option per question
  score: number;
  totalQuestions: number;
  timestamp: number;
}

export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  NONE = 'NONE'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64
  isError?: boolean;
}
