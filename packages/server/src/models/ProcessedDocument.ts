import mongoose, { Document, Schema } from 'mongoose';
import { DocumentType } from './Job';

export interface IChunk {
    text: string;
    embedding?: number[];
}

export interface IPage {
    pageNumber: number;
    imageUrl?: string;
    text: string;
    chunks: IChunk[];
}

export interface IProcessedDocument extends Document {
    url: string;
    title: string;
    documentType: DocumentType;
    htmlContent?: string;
    text: string;
    pages: IPage[];
    chunks: IChunk[];
    groups: mongoose.Types.ObjectId[];
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const ChunkSchema = new Schema({
    text: { type: String, required: true },
    embedding: { type: [Number] }
});

const PageSchema = new Schema({
    pageNumber: { type: Number, required: true },
    imageUrl: { type: String },
    text: { type: String, required: true },
    chunks: [ChunkSchema]
});

const ProcessedDocumentSchema = new Schema<IProcessedDocument>(
    {
        url: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        documentType: { 
            type: String, 
            enum: Object.values(DocumentType), 
            required: true 
        },
        htmlContent: { type: String },
        text: { type: String, required: true },
        pages: [PageSchema],
        chunks: [ChunkSchema],
        groups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
        metadata: { type: Schema.Types.Mixed, default: {} }
    },
    { timestamps: true }
);

export const ProcessedDocument = mongoose.model<IProcessedDocument>('ProcessedDocument', ProcessedDocumentSchema);
