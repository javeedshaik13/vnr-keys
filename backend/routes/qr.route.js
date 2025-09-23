import express from "express";
import { rolePermissions } from '../middleware/roleAuth.js';
import { asyncHandler } from '../utils/errorHandler.js';
import Key from '../models/key.model.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errorHandler.js';
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { emitKeyReturned } from '../services/socketService.js';
import AuditService from '../services/auditService.js';

const router = express.Router();

/**
 * Process a QR scan key return (single or batch)
 * POST /api/qr/return
 */
router.post("/return", rolePermissions.adminOrSecurity, asyncHandler(async (req, res) => {
  const { qrData } = req.body;
  
  if (!qrData) {
    throw new ValidationError("QR data is required");
  }

  // Parse QR data if it's a string
  const parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;

  // Extract keyIds - handle both direct and nested qrData structures
  const keyIdsToProcess = parsedData.qrData?.keyIds || parsedData.keyIds;
  
  if (!keyIdsToProcess || !Array.isArray(keyIdsToProcess) || keyIdsToProcess.length === 0) {
    throw new ValidationError("No keys provided for return");
  }

  // Validate timestamp (within 5 minutes)
  const qrTimestamp = new Date(parsedData.timestamp);
  const now = new Date();
  const timeDiff = Math.abs(now - qrTimestamp) / 1000;
  if (timeDiff > 300) {
    throw new ValidationError("QR code has expired");
  }

  // Find all keys
  const keys = await Key.find({ _id: { $in: keyIdsToProcess } }).populate('takenBy.userId');
  if (keys.length !== keyIdsToProcess.length) {
    throw new NotFoundError("One or more keys not found");
  }

  // Process returns for all keys
  const returnPromises = keys.map(async (key) => {
    if (key.status === 'available') {
      throw new ConflictError(`Key ${key.keyNumber} is already available`);
    }

    const originalUser = key.takenBy.userId;
    const returnedBy = await User.findById(req.userId);

    // Return the key
    await key.returnKey();

    // Log the return with isBatchReturn flag since it's coming from volunteer return
    await AuditService.logKeyReturned(key, returnedBy, req, originalUser, {
      isBatchReturn: parsedData.keyIds.length > 1
    });

    // Emit socket event for real-time updates
    emitKeyReturned(key, req.userId);
  });

  // Wait for all operations to complete
  await Promise.all(returnPromises);

  res.status(200).json({
    success: true,
    message: `${keys.length} key(s) returned successfully`,
    data: { keys }
  });
}));

export default router;