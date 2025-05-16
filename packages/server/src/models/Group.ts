import mongoose, { Document, Schema } from 'mongoose';

export interface IGroup extends Document {
    name: string;
    description?: string;
    parentGroup?: mongoose.Types.ObjectId;
    childGroups: mongoose.Types.ObjectId[];
    documents: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String },
        parentGroup: { type: Schema.Types.ObjectId, ref: 'Group' },
        childGroups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
        documents: [{ type: Schema.Types.ObjectId, ref: 'ProcessedDocument' }]
    },
    { timestamps: true }
);

export const Group = mongoose.model<IGroup>('Group', GroupSchema);