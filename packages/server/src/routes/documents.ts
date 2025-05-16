import { Request, Response } from 'express';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ProcessedDocument } from '../models/ProcessedDocument';
import { Group } from '../models/Group';
import { authMiddleware } from '../middleware/auth';

export const documentsRouter = Router();

// Apply auth middleware once globally to all routes in this router
documentsRouter.use(authMiddleware);

// Get all documents
documentsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Query parameters
    const { type, group } = req.query;
    const query: any = {};
    
    // Filter by document type
    if (type) {
      query.documentType = type;
    }
    
    // Filter by group
    if (group) {
      const groupDoc = await Group.findById(group);
      if (!groupDoc) {
        res.status(StatusCodes.NOT_FOUND).json({ error: 'Group not found' });
        return;
      }
      
      query.groups = group;
    }
    
    // Fetch documents with pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const documents = await ProcessedDocument.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('groups');
    
    const total = await ProcessedDocument.countDocuments(query);
    
    res.json({
      documents,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch documents' });
  }
});

// Get document by ID
documentsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await ProcessedDocument.findById(req.params.id).populate('groups');
    
    if (!document) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Document not found' });
      return;
    }
    
    res.json(document);
  } catch (error) {
    console.error(`Error fetching document ${req.params.id}:`, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch document' });
  }
});

// Update document metadata
documentsRouter.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, metadata } = req.body;
    const updates: any = {};
    
    if (title) updates.title = title;
    if (metadata) updates.metadata = metadata;
    
    const document = await ProcessedDocument.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    if (!document) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Document not found' });
      return;
    }
    
    res.json(document);
  } catch (error) {
    console.error(`Error updating document ${req.params.id}:`, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update document' });
  }
});

// Update document groups
documentsRouter.put('/:id/groups', async (req: Request, res: Response): Promise<void> => {
  try {
    const { groups } = req.body;
    
    if (!Array.isArray(groups)) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Groups must be an array' });
      return;
    }
    
    // Validate all group IDs
    for (const groupId of groups) {
      const groupExists = await Group.exists({ _id: groupId });
      if (!groupExists) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: `Group not found: ${groupId}` });
        return;
      }
    }
    
    const document = await ProcessedDocument.findByIdAndUpdate(
      req.params.id,
      { $set: { groups } },
      { new: true }
    ).populate('groups');
    
    if (!document) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Document not found' });
      return;
    }
    
    // Update groups with this document
    await Group.updateMany(
      { _id: { $in: groups } },
      { $addToSet: { documents: document._id } }
    );
    
    // Remove document from groups it no longer belongs to
    await Group.updateMany(
      { _id: { $nin: groups }, documents: document._id },
      { $pull: { documents: document._id } }
    );
    
    res.json(document);
  } catch (error) {
    console.error(`Error updating document groups ${req.params.id}:`, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update document groups' });
  }
});

// Delete document
documentsRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const document = await ProcessedDocument.findById(req.params.id);
    
    if (!document) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Document not found' });
      return;
    }
    
    // Remove document from all groups
    await Group.updateMany(
      { documents: document._id },
      { $pull: { documents: document._id } }
    );
    
    // Delete document
    await document.deleteOne();
    
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(`Error deleting document ${req.params.id}:`, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete document' });
  }
});