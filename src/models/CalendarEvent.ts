import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICalendarEvent extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: 'coaching' | 'study' | 'assignment' | 'other';
  startTime: Date;
  endTime: Date;
  coachId?: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  status: 'scheduled' | 'completed' | 'cancelled' | 'change_requested';
  changeRequest?: {
    requestedBy: mongoose.Types.ObjectId;
    newStartTime: Date;
    newEndTime: Date;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Date;
    respondedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema: Schema = new Schema(
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
      enum: ['coaching', 'study', 'assignment', 'other'],
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    coachId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'change_requested'],
      default: 'scheduled',
    },
    changeRequest: {
      requestedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      newStartTime: Date,
      newEndTime: Date,
      reason: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
      },
      requestedAt: Date,
      respondedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

CalendarEventSchema.index({ coachId: 1, startTime: 1 });
CalendarEventSchema.index({ studentId: 1, startTime: 1 });

const CalendarEvent: Model<ICalendarEvent> = mongoose.models.CalendarEvent || mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);

export default CalendarEvent;
