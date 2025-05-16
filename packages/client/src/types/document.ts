export enum DocumentType {
  PATENT = 'patent',
  RESEARCH_PAPER = 'research_paper',
  ARTICLE = 'article',
  TECHNICAL_REPORT = 'technical_report',
  MANUAL = 'manual',
  SPECIFICATION = 'specification',
  OTHER = 'other'
}

export interface Document {
  id: string;
  title: string;
  url?: string;
  type: DocumentType;
  createdAt: string;
  updatedAt: string;
  content?: string;
  groups?: string[];
  tags?: string[];
}

export interface CreateDocumentRequest {
  title: string;
  url?: string;
  type: DocumentType;
  file?: File;
  groups?: string[];
  tags?: string[];
}