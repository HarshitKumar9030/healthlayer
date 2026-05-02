import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  userId: string;
  originalFileName: string;
  originalFileUrl: string;
  extractedText: string;
  structuredData: {
    hospitalInfo?: {
      name: string;
      address?: string;
      date?: string;
    };
    observations: Array<{
      name: string;
      value: number | string;
      unit?: string;
      referenceRange?: string;
      flag: 'normal' | 'high' | 'low' | 'critical';
    }>;
    summary: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    userId: { type: String, required: true, index: true },
    originalFileName: { type: String, required: true },
    originalFileUrl: { type: String, required: true },
    extractedText: { type: String, required: true },
    structuredData: {
      hospitalInfo: {
        name: String,
        address: String,
        date: String,
      },
      observations: [
        {
          name: String,
          value: mongoose.Schema.Types.Mixed,
          unit: String,
          referenceRange: String,
          flag: { type: String, enum: ['normal', 'high', 'low', 'critical'] },
        },
      ],
      summary: String,
    },
  },
  { timestamps: true }
);

export const Report = mongoose.models.Report || mongoose.model<IReport>('Report', reportSchema);
