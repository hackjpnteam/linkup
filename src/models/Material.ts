import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMaterial extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: 'vocab' | 'grammar' | 'pronunciation' | 'video' | 'document';
  content: string;
  fileUrl?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema: Schema = new Schema(
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
      enum: ['vocab', 'grammar', 'pronunciation', 'video', 'document'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    tags: [{
      type: String,
    }],
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

MaterialSchema.index({ type: 1, level: 1 });
MaterialSchema.index({ tags: 1 });

const Material: Model<IMaterial> = mongoose.models.Material || mongoose.model<IMaterial>('Material', MaterialSchema);

export default Material;
