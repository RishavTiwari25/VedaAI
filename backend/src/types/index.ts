export interface QuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface AssignmentInput {
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions?: string;
  fileUrl?: string;
  schoolName?: string;
  teacherName?: string;
  timeAllowed?: string;
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

export interface JobProgressEvent {
  assignmentId: string;
  status: AssignmentStatus;
  progress: number;
  message: string;
  result?: GeneratedPaper;
  error?: string;
}
