import mongoose, { Document, Schema } from 'mongoose';
import { AssignmentStatus, QuestionType } from '../types';

export interface IAssignment extends Document {
  title: string;
  subject: string;
  className: string;
  dueDate: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema<QuestionType>({
  type: { type: String, required: true },
  count: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 },
});

const AssignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  className: { type: String, required: true, trim: true },
  dueDate: { type: Date, required: true },
  questionTypes: { type: [QuestionTypeSchema], required: true },
  additionalInstructions: { type: String, trim: true },
  fileUrl: { type: String },
  schoolName: { type: String, default: 'Delhi Public School' },
  teacherName: { type: String, default: 'John Doe' },
  timeAllowed: { type: String, default: '3 Hours' },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  jobId: { type: String },
  totalQuestions: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
}, { timestamps: true });

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
