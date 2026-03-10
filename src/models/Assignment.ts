import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'vocab' | 'grammar' | 'pronunciation' | 'mixed';
  dueDate: Date;
  materials: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssignmentState extends Document {
  _id: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed';
  score?: number;
  feedback?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['vocab', 'grammar', 'pronunciation', 'mixed'],
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    materials: [{
      type: Schema.Types.ObjectId,
      ref: 'Material',
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const AssignmentStateSchema: Schema = new Schema(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'reviewed'],
      default: 'pending',
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
    },
    submittedAt: {
      type: Date,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

AssignmentStateSchema.index({ assignmentId: 1, userId: 1 }, { unique: true });

export const Assignment: Model<IAssignment> = mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);
export const AssignmentState: Model<IAssignmentState> = mongoose.models.AssignmentState || mongoose.model<IAssignmentState>('AssignmentState', AssignmentStateSchema);
