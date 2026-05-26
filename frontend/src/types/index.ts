// Shared TypeScript types for VedaAI frontend

export interface QuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions: string;
  schoolName: string;
  teacherName: string;
  timeAllowed: string;
  file?: File | null;
}

export interface Question {
  id: string;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
  answerKey?: string;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface PaperMetadata {
  totalQuestions: number;
  totalMarks: number;
  subject: string;
  className: string;
  schoolName: string;
  teacherName: string;
  timeAllowed: string;
  generatedAt: string;
}

export interface GeneratedPaper {
  metadata: PaperMetadata;
  sections: Section[];
}

export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions?: string;
  fileUrl?: string;
  schoolName: string;
  teacherName: string;
  timeAllowed: string;
  status: AssignmentStatus;
  jobId?: string;
  totalQuestions: number;
  totalMarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentWithResult {
  assignment: Assignment;
  result: GeneratedPaper | null;
}

export interface JobProgressEvent {
  assignmentId: string;
  status: AssignmentStatus;
  progress: number;
  message: string;
  result?: GeneratedPaper;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  cached?: boolean;
}

export const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Answer Questions',
  'Long Answer Questions',
  'True/False Questions',
  'Fill in the Blanks',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Match the Following',
  'Assertion-Reason Questions',
  'Case Study Questions',
] as const;

export const CLASS_OPTIONS = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12', 'Grade 1', 'Grade 2', 'Grade 3',
  'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8',
  'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
] as const;

export const SUBJECT_OPTIONS = [
  'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi', 'Social Studies', 'History', 'Geography',
  'Civics', 'Economics', 'Computer Science', 'Environmental Science',
  'Sanskrit', 'French', 'General Knowledge',
] as const;

export const TIME_OPTIONS = [
  '30 Minutes', '45 Minutes', '1 Hour', '1.5 Hours',
  '2 Hours', '2.5 Hours', '3 Hours', '3.5 Hours',
] as const;
