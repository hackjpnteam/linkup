import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPronunciationExercise extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  targetText: string;
  targetAudioUrl?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPronunciationAttempt extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  exerciseId: mongoose.Types.ObjectId;
  audioUrl: string;
  score: number;
  accuracyScore: number;
  fluencyScore: number;
  pronunciationScore: number;
  feedback: string;
  wordScores: {
    word: string;
    score: number;
    phonemes?: {
      phoneme: string;
      score: number;
    }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const PronunciationExerciseSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    targetText: {
      type: String,
      required: true,
    },
    targetAudioUrl: {
      type: String,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    category: {
      type: String,
      default: 'general',
    },
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

const PronunciationAttemptSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: 'PronunciationExercise',
      required: true,
      index: true,
    },
    audioUrl: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    accuracyScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    fluencyScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    pronunciationScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
    },
    wordScores: [{
      word: String,
      score: Number,
      phonemes: [{
        phoneme: String,
        score: Number,
      }],
    }],
  },
  {
    timestamps: true,
  }
);

export const PronunciationExercise: Model<IPronunciationExercise> = mongoose.models.PronunciationExercise || mongoose.model<IPronunciationExercise>('PronunciationExercise', PronunciationExerciseSchema);
export const PronunciationAttempt: Model<IPronunciationAttempt> = mongoose.models.PronunciationAttempt || mongoose.model<IPronunciationAttempt>('PronunciationAttempt', PronunciationAttemptSchema);
