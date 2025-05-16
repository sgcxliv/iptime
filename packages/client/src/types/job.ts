export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum DocumentType {
  PATENT = 'patent',
  RESEARCH_PAPER = 'research_paper',
  ARTICLE = 'article',
  TECHNICAL_REPORT = 'technical_report',
  MANUAL = 'manual',
  SPECIFICATION = 'specification',
  OTHER = 'other'
}

export interface Job {
  id: string;
  title: string;
  status: JobStatus;
  documentType: DocumentType;
  createdAt: string;
  updatedAt: string;
  sourceUrl?: string;
  content?: string;
  errorMessage?: string;
  embedding?: number[];
  imageData?: string;
}

export interface CreateJobRequest {
  title: string;
  documentType: DocumentType;
  sourceUrl?: string;
  file?: File;
}