
export type UserRole = 'TEACHER' | 'STUDENT' | null;

export type SubjectId = 'M1_History' | 'M1_Social' | 'M5_History' | 'M5_Social' | 'M6_Social';

export type SpecialStatus = 'Normal' | 'ร' | 'มส.';

export interface ScoreData {
  collected: number[]; // Array of 6 scores, max 10 each
  midterm: number;     // Max 20
  final: number;       // Max 20
}

export interface Student {
  id: string;
  name: string;
  scores: ScoreData;
  status: SpecialStatus;
  redeemedDraws?: number; // Added for Lucky Draw System
}

export interface SubjectClass {
  id: SubjectId;
  name: string;
  students: Student[];
}

export interface GradeResult {
  totalScore: number;
  grade: number | string; // number 0-4 or string status
  isPass: boolean;
}

// Configuration Constants
export const SUBJECTS: { id: SubjectId; name: string }[] = [
  { id: 'M1_History', name: 'ม.1 ประวัติศาสตร์' },
  { id: 'M1_Social', name: 'ม.1 สังคมศึกษา' },
  { id: 'M5_History', name: 'ม.5 ประวัติศาสตร์' },
  { id: 'M5_Social', name: 'ม.5 สังคมศึกษา' },
  { id: 'M6_Social', name: 'ม.6 สังคมศึกษา' },
];

export const MAX_SCORES = {
  collected: 10, // Per slot
  midterm: 20,
  final: 20,
};
