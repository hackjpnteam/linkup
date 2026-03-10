import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVocabCard {
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
  audioUrl?: string;
}

export interface IVocabDeck extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  cards: IVocabCard[];
  level: 'beginner' | 'intermediate' | 'advanced';
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVocabProgress extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  deckId: mongoose.Types.ObjectId;
  cardIndex: number;
  status: 'new' | 'learning' | 'mastered';
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt: Date;
  nextReviewAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VocabCardSchema: Schema = new Schema({
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  pronunciation: { type: String },
  example: { type: String },
  audioUrl: { type: String },
});

const VocabDeckSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    cards: [VocabCardSchema],
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
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

const VocabProgressSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deckId: {
      type: Schema.Types.ObjectId,
      ref: 'VocabDeck',
      required: true,
      index: true,
    },
    cardIndex: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'learning', 'mastered'],
      default: 'new',
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
    },
    lastReviewedAt: {
      type: Date,
    },
    nextReviewAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

VocabProgressSchema.index({ userId: 1, deckId: 1, cardIndex: 1 }, { unique: true });

export const VocabDeck: Model<IVocabDeck> = mongoose.models.VocabDeck || mongoose.model<IVocabDeck>('VocabDeck', VocabDeckSchema);
export const VocabProgress: Model<IVocabProgress> = mongoose.models.VocabProgress || mongoose.model<IVocabProgress>('VocabProgress', VocabProgressSchema);
