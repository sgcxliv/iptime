import { Request, Response } from 'express';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Group } from '../models/Group';
import { ProcessedDocument } from '../models/ProcessedDocument';
import { authMiddleware } from '../middleware/auth';
import { ObjectId } from 'mongodb';

export const groupsRouter = Router();

// Apply auth middleware once globally to all routes in this router
groupsRouter.use(authMiddleware);

// Get all groups
groupsRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const groups = await Group.find()
      .sort({ name: 1 })
      .populate('parentGroup', 'name')
      .populate('childGroups', 'name')
      .exec();
    
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch groups' });
  }
});

// Get group by ID
groupsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('parentGroup')
      .populate('childGroups')
      .populate('documents');
    
    if (!group) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Group not found' });
      return;
    }
    
    res.json(group);
  } catch (error) {
    console.error(`Error fetching group ${req.params.id}:`, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to fetch group' });
  }
});

// Create new group
groupsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, parentGroup } = req.body;
    
    if (!name) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Group name is required' });
      return;
    }
    
    // Check if group with same name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      res.status(StatusCodes.CONFLICT).json({ error: 'Group with this name already exists' });
      return;
    }
    
    const groupData: any = { name, description };
    
    // Handle parent group
    if (parentGroup) {
      const parent = await Group.findById(parentGroup);
      if (!parent) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: 'Parent group not found' });
        return;
      }
      
      groupData.parentGroup = parentGroup;
    }
    
    // Create group
    const group = new Group(groupData);
    await group.save();
    
    // Update parent group's child groups
    if (parentGroup) {
      await Group.findByIdAndUpdate(
        parentGroup,
        { $addToSet: { childGroups: group._id } }
      );
    }
    
    res.status(StatusCodes.CREATED).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create group' });
  }
});

// Update group
groupsRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, parentGroup } = req.body;
    const updates: any = {};
    
    if (name) {
      // Check if group with same name already exists (excluding current group)
      const existingGroup = await Group.findOne({ name, _id: { $ne: req.params.id } });
      if (existingGroup) {
        res.status(StatusCodes.CONFLICT).json({ error: 'Group with this name already exists' });
        return;
      }
      
      updates.name = name;
    }
    
    if (description !== undefined) {
      updates.description = description;
    }
    
    const group = await Group.findById(req.params.id);
    if (!group) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Group not found' });
      return;
    }
    
    // Handle parent group change
    if (parentGroup !== undefined && parentGroup !== group.parentGroup?.toString()) {
      // Remove from old parent's child groups
      if (group.parentGroup) {
        await Group.findByIdAndUpdate(
          group.parentGroup,
          { $pull: { childGroups: group._id } }
        );
      }
      
      // Add to new parent's child groups
      if (parentGroup) {
        // Check for circular reference
        if (parentGroup === (group._id as ObjectId).toString()) {
          res.status(StatusCodes.BAD_REQUEST).json({ error: 'A group cannot be its own parent' });
          return;
        }
        
        // Check if parent exists
        const parent = await Group.findById(parentGroup);
        if (!parent) {
          res.status(StatusCodes.BAD_REQUEST).json({ error: 'Parent group not found' });
          return;
        }
        
        // Check for deeper circular references
        let currentGroup = parent;
        
        while (currentGroup.parentGroup) {
          if (currentGroup.parentGroup.toString() === (group._id as ObjectId).toString()) {
            res.status(StatusCodes.BAD_REQUEST).json({ error: 'Circular reference in group hierarchy' });
            return;
          }
          
          const foundGroup = await Group.findById(currentGroup.parentGroup);
          if (!foundGroup) break;
          
          currentGroup = foundGroup;
        }
        
        await Group.findByIdAndUpdate(
          parentGroup,
          { $addToSet: { childGroups: group._id } }
        );
      }
      
      updates.parentGroup = parentGroup || null;
    }
    
    // Update group
    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    )
      .populate('parentGroup')
      .populate('childGroups')
      .populate('documents');
    
    res.json(updatedGroup);
  } catch (error) {
    console.error(`Error updating group ${req.params.id}:`, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update group' });
  }
});

// Delete group
groupsRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Group not found' });
      return;
    }
    
    // Remove group from parent's child groups
    if (group.parentGroup) {
      await Group.findByIdAndUpdate(
        group.parentGroup,
        { $pull: { childGroups: group._id } }
      );
    }
    
    // Update child groups to remove this parent
    await Group.updateMany(
      { parentGroup: group._id },
      { $unset: { parentGroup: "" } }
    );
    
    // Remove group from documents
    await ProcessedDocument.updateMany(
      { groups: group._id },
      { $pull: { groups: group._id } }
    );
    
    // Delete group
    await group.deleteOne();
    
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error(`Error deleting group ${req.params.id}:`, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete group' });
  }
});

// Add documents to group
groupsRouter.post('/:id/documents', async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentIds } = req.body;
    
    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Document IDs array is required' });
      return;
    }
    
    const group = await Group.findById(req.params.id);
    if (!group) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Group not found' });
      return;
    }
    
    // Add documents to group
    group.documents.push(...documentIds.filter(id => !group.documents.includes(id)));
    await group.save();
    
    // Add group to documents
    await ProcessedDocument.updateMany(
      { _id: { $in: documentIds } },
      { $addToSet: { groups: group._id } }
    );
    
    const updatedGroup = await Group.findById(req.params.id).populate('documents');
    res.json(updatedGroup);
  } catch (error) {
    console.error(`Error adding documents to group ${req.params.id}:`, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to add documents to group' });
  }
});

// Remove documents from group
groupsRouter.delete('/:id/documents', async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentIds } = req.body;
    
    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'Document IDs array is required' });
      return;
    }
    
    const group = await Group.findById(req.params.id);
    if (!group) {
      res.status(StatusCodes.NOT_FOUND).json({ error: 'Group not found' });
      return;
    }
    
    // Remove documents from group
    group.documents = group.documents.filter(id => !documentIds.includes(id.toString()));
    await group.save();
    
    // Remove group from documents
    await ProcessedDocument.updateMany(
      { _id: { $in: documentIds } },
      { $pull: { groups: group._id } }
    );
    
    const updatedGroup = await Group.findById(req.params.id).populate('documents');
    res.json(updatedGroup);
  } catch (error) {
    console.error(`Error removing documents from group ${req.params.id}:`, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to remove documents from group' });
  }
});