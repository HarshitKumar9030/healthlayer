import mongoose, { Schema, Document } from 'mongoose';

export interface IObservation extends Document {
  userId: string;
  reportId: mongoose.Types.ObjectId | string;
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  flag: 'normal' | 'high' | 'low' | 'critical';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const observationSchema = new Schema<IObservation>(
  {
    userId: { type: String, required: true, index: true },
    reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true, index: true },
    name: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    unit: { type: String },
    referenceRange: { type: String },
    flag: { type: String, enum: ['normal', 'high', 'low', 'critical'], required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Observation = mongoose.models.Observation || mongoose.model<IObservation>('Observation', observationSchema);
