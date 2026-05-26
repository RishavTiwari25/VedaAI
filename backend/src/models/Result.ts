import mongoose, { Document, Schema } from 'mongoose';
import { GeneratedPaper } from '../types';

export interface IResult extends Document {
  assignmentId: mongoose.Types.ObjectId;
  paper: GeneratedPaper;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema({
  id: String,
  text: String,
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'] },
  marks: Number,
  answerKey: String,
});

const SectionSchema = new Schema({
  title: String,
  instruction: String,
  questions: [QuestionSchema],
});

const MetadataSchema = new Schema({
  totalQuestions: Number,
  totalMarks: Number,
  subject: String,
  className: String,
  schoolName: String,
  teacherName: String,
  timeAllowed: String,
  generatedAt: String,
});

const ResultSchema = new Schema<IResult>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
  paper: {
    metadata: MetadataSchema,
    sections: [SectionSchema],
  },
  version: { type: Number, default: 1 },
}, { timestamps: true });

export const Result = mongoose.model<IResult>('Result', ResultSchema);
