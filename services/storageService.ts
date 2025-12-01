import { Exam, StudentSubmission } from '../types';

const EXAMS_KEY = 'quizmaster_exams';
const SUBMISSIONS_KEY = 'quizmaster_submissions';

export const StorageService = {
  // Exam Management
  getExams: (): Exam[] => {
    const data = localStorage.getItem(EXAMS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveExam: (exam: Exam): void => {
    const exams = StorageService.getExams();
    const existingIndex = exams.findIndex(e => e.id === exam.id);
    if (existingIndex >= 0) {
      exams[existingIndex] = exam;
    } else {
      exams.push(exam);
    }
    localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
  },

  getExamByCode: (code: string): Exam | undefined => {
    const exams = StorageService.getExams();
    return exams.find(e => e.code === code && e.active);
  },

  getExamById: (id: string): Exam | undefined => {
    const exams = StorageService.getExams();
    return exams.find(e => e.id === id);
  },

  deleteExam: (id: string): void => {
    const exams = StorageService.getExams().filter(e => e.id !== id);
    localStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
  },

  // Submission Management
  getSubmissions: (examId: string): StudentSubmission[] => {
    const data = localStorage.getItem(SUBMISSIONS_KEY);
    const allSubmissions: StudentSubmission[] = data ? JSON.parse(data) : [];
    return allSubmissions.filter(s => s.examId === examId);
  },

  saveSubmission: (submission: StudentSubmission): void => {
    const data = localStorage.getItem(SUBMISSIONS_KEY);
    const allSubmissions: StudentSubmission[] = data ? JSON.parse(data) : [];
    allSubmissions.push(submission);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(allSubmissions));
  },

  getStudentAttempts: (examId: string, name: string, studentClass: string): number => {
    const submissions = StorageService.getSubmissions(examId);
    return submissions.filter(
      s => s.studentName.toLowerCase() === name.toLowerCase() && 
           s.studentClass.toLowerCase() === studentClass.toLowerCase()
    ).length;
  }
};