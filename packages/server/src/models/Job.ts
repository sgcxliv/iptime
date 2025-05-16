import mongoose, { Document, Schema } from 'mongoose';

export enum JobStatus {
    QUEUED = 'queued',
    FETCHING = 'fetching',
    PROCESSING = 'processing',
    CHUNKING = 'chunking',
    EMBEDDING = 'embedding',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

export enum DocumentType {
    HTML = 'html',
    PDF = 'pdf',
    UNKNOWN = 'unknown'
}

export interface IJob extends Document {
    url: string;
    status: JobStatus;
    documentType: DocumentType;
    progress: number;
    error?: string;
    document?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    statusHistory: Array<{
        status: JobStatus;
        timestamp: Date;
        message?: string;
    }>;
}

const JobSchema = new Schema<IJob>(
    {
        url: { type: String, required: true },
        status: { 
            type: String, 
            enum: Object.values(JobStatus), 
            default: JobStatus.QUEUED 
        },
        documentType: { 
            type: String, 
            enum: Object.values(DocumentType), 
            default: DocumentType.UNKNOWN 
        },
        progress: { type: Number, default: 0 },
        error: { type: String },
        document: { type: Schema.Types.ObjectId, ref: 'ProcessedDocument' },
        statusHistory: [{
            status: { 
                type: String, 
                enum: Object.values(JobStatus)
            },
            timestamp: { type: Date, default: Date.now },
            message: { type: String }
        }]
    },
    { timestamps: true }
);

export const Job = mongoose.model<IJob>('Job', JobSchema);