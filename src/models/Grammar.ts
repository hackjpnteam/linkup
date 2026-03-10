import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGrammarQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface IGrammarLesson extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  questions: IGrammarQuestion[];
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGrammarProgress extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  isCompleted: boolean;
  quizScore?: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GrammarQuestionSchema: Schema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String, required: true },
});

const GrammarLessonSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    order: {
      type: Number,
      default: 0,
    },
    questions: [GrammarQuestionSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const GrammarProgressSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'GrammarLesson',
      required: true,
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    quizScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

GrammarProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export const GrammarLesson: Model<IGrammarLesson> = mongoose.models.GrammarLesson || mongoose.model<IGrammarLesson>('GrammarLesson', GrammarLessonSchema);
export const GrammarProgress: Model<IGrammarProgress> = mongoose.models.GrammarProgress || mongoose.model<IGrammarProgress>('GrammarProgress', GrammarProgressSchema);
