import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudyLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  duration: number; // minutes
  type: 'vocab' | 'grammar' | 'pronunciation' | 'assignment';
  contentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StudyLogSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['vocab', 'grammar', 'pronunciation', 'assignment'],
      required: true,
    },
    contentId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

StudyLogSchema.index({ userId: 1, date: 1 });

const StudyLog: Model<IStudyLog> = mongoose.models.StudyLog || mongoose.model<IStudyLog>('StudyLog', StudyLogSchema);

export default StudyLog;
