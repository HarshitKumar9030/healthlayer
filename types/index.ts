// Shared types for the application

export interface Observation {
  name: string;
  value: number | string;
  unit?: string;
  referenceRange?: string;
  flag: 'normal' | 'high' | 'low' | 'critical';
  date?: Date;
}

export interface ParsedMedicalReport {
  hospitalInfo?: {
    name: string;
    address?: string;
    date?: string;
  };
  observations: Observation[];
  summary: string;
}

export interface Report {
  _id?: string;
  userId: string;
  originalFileName: string;
  originalFileUrl: string;
  extractedText: string;
  structuredData: ParsedMedicalReport;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  _id?: string;
  clerkId: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MpcObservation {
  name: string;
  value: number | string;
  unit?: string;
  flag: 'normal' | 'high' | 'low' | 'critical';
  reportId: string;
  reportDate: Date;
}

export interface UploadResponse {
  success: boolean;
  reportId?: string;
  error?: string;
}
