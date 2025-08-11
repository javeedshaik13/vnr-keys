import { Key } from "../models/key.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/errorHandler.js";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../utils/errorHandler.js";
import {
  emitKeyTaken,
  emitKeyReturned,
  emitKeyCreated,
  emitKeyUpdated,
  emitKeyDeleted,
  emitFrequentlyUsedToggled,
  emitQRScanReturn,
  emitQRScanRequest
} from "../services/socketService.js";

/**
 * Get all keys with optional filtering (respects user department access)
 */
export const getAllKeys = asyncHandler(async (req, res) => {
  const { status, category, search, frequentlyUsed } = req.query;

  // Get user to apply department-based filtering
  const user = await User.findById(req.userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  // Start with keys accessible to the user
  let keysQuery = Key.findAccessibleToUser(user);

  // Apply additional filters
  const additionalFilters = {};
  if (status) additionalFilters.status = status;
  if (category) additionalFilters.category = category;
  if (frequentlyUsed === 'true') additionalFilters.frequentlyUsed = true;

  // Apply additional filters if any
  if (Object.keys(additionalFilters).length > 0) {
    keysQuery = keysQuery.find(additionalFilters);
  }

  // Search functionality
  if (search) {
    keysQuery = keysQuery.find({
      $or: [
        { keyNumber: { $regex: search, $options: 'i' } },
        { keyName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ]
    });
  }

  const keys = await keysQuery
    .populate('takenBy.userId', 'name email')
    .sort({ keyNumber: 1 });

  res.status(200).json({
    success: true,
    message: "Keys retrieved successfully",
    data: {
      keys,
      total: keys.length,
    },
  });
});

/**
 * Get available keys (respects user department access)
 */
export const getAvailableKeys = asyncHandler(async (req, res) => {
  // Get user to apply department-based filtering
  const user = await User.findById(req.userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const keys = await Key.findAvailableForUser(user)
    .sort({ keyNumber: 1 });

  res.status(200).json({
    success: true,
    message: "Available keys retrieved successfully",
    data: {
      keys,
      total: keys.length,
    },
  });
});

/**
 * Get unavailable keys
 */
export const getUnavailableKeys = asyncHandler(async (req, res) => {
  const keys = await Key.findUnavailable()
    .populate('takenBy.userId', 'name email')
    .sort({ takenAt: -1 });
  
  res.status(200).json({
    success: true,
    message: "Unavailable keys retrieved successfully",
    data: {
      keys,
      total: keys.length,
    },
  });
});

/**
 * Get keys taken by current user
 */
export const getMyTakenKeys = asyncHandler(async (req, res) => {
  const keys = await Key.findTakenByUser(req.userId)
    .sort({ takenAt: -1 });
  
  res.status(200).json({
    success: true,
    message: "Your taken keys retrieved successfully",
    data: {
      keys,
      total: keys.length,
    },
  });
});

/**
 * Get frequently used keys
 */
export const getFrequentlyUsedKeys = asyncHandler(async (req, res) => {
  const keys = await Key.findFrequentlyUsed()
    .sort({ keyNumber: 1 });
  
  res.status(200).json({
    success: true,
    message: "Frequently used keys retrieved successfully",
    data: {
      keys,
      total: keys.length,
    },
  });
});

/**
 * Get a single key by ID
 */
export const getKeyById = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  
  const key = await Key.findById(keyId)
    .populate('takenBy.userId', 'name email');
  
  if (!key) {
    throw new NotFoundError("Key not found");
  }
  
  res.status(200).json({
    success: true,
    message: "Key retrieved successfully",
    data: { key },
  });
});

/**
 * Take a key (for faculty users)
 */
export const takeKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;

  const key = await Key.findById(keyId);
  if (!key) {
    throw new NotFoundError("Key not found");
  }

  if (key.status === 'unavailable') {
    throw new ConflictError("Key is already taken");
  }

  const user = await User.findById(req.userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  await key.takeKey(user);

  // Emit real-time update
  emitKeyTaken(key, req.userId);

  res.status(200).json({
    success: true,
    message: `Key ${key.keyNumber} (${key.keyName}) taken successfully`,
    data: { key },
  });
});

/**
 * Return a key
 */
export const returnKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;

  const key = await Key.findById(keyId);
  if (!key) {
    throw new NotFoundError("Key not found");
  }

  if (key.status === 'available') {
    throw new ConflictError("Key is already available");
  }

  // Check if the user is returning their own key or if they're security/admin
  if (req.userRole !== 'admin' && req.userRole !== 'security' &&
      key.takenBy.userId.toString() !== req.userId) {
    throw new ValidationError("You can only return keys you have taken");
  }

  await key.returnKey();

  // Emit real-time update
  emitKeyReturned(key, req.userId);

  res.status(200).json({
    success: true,
    message: `Key ${key.keyNumber} (${key.keyName}) returned successfully`,
    data: { key },
  });
});

/**
 * Create a new key (admin only)
 */
export const createKey = asyncHandler(async (req, res) => {
  const {
    keyNumber,
    keyName,
    location,
    description,
    category,
    frequentlyUsed,
  } = req.body;

  // Check if key number already exists
  const existingKey = await Key.findOne({ keyNumber });
  if (existingKey) {
    throw new ConflictError("Key number already exists");
  }

  const key = new Key({
    keyNumber,
    keyName,
    location,
    description,
    category,
    frequentlyUsed: frequentlyUsed || false,
  });

  await key.save();

  // Emit real-time update
  emitKeyCreated(key, req.userId);

  res.status(201).json({
    success: true,
    message: "Key created successfully",
    data: { key },
  });
});

/**
 * Update a key (admin only)
 */
export const updateKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const updates = req.body;
  
  const key = await Key.findById(keyId);
  if (!key) {
    throw new NotFoundError("Key not found");
  }
  
  // If updating key number, check for duplicates
  if (updates.keyNumber && updates.keyNumber !== key.keyNumber) {
    const existingKey = await Key.findOne({ keyNumber: updates.keyNumber });
    if (existingKey) {
      throw new ConflictError("Key number already exists");
    }
  }
  
  Object.assign(key, updates);
  await key.save();
  
  res.status(200).json({
    success: true,
    message: "Key updated successfully",
    data: { key },
  });
});

/**
 * Delete a key (admin only) - soft delete
 */
export const deleteKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  
  const key = await Key.findById(keyId);
  if (!key) {
    throw new NotFoundError("Key not found");
  }
  
  if (key.status === 'unavailable') {
    throw new ConflictError("Cannot delete a key that is currently taken");
  }
  
  key.isActive = false;
  await key.save();
  
  res.status(200).json({
    success: true,
    message: "Key deleted successfully",
  });
});

/**
 * Toggle frequently used status
 */
export const toggleFrequentlyUsed = asyncHandler(async (req, res) => {
  const { keyId } = req.params;

  const key = await Key.findById(keyId);
  if (!key) {
    throw new NotFoundError("Key not found");
  }

  key.frequentlyUsed = !key.frequentlyUsed;
  await key.save();

  // Emit real-time update
  emitFrequentlyUsedToggled(key, req.userId);

  res.status(200).json({
    success: true,
    message: `Key ${key.frequentlyUsed ? 'added to' : 'removed from'} frequently used`,
    data: { key },
  });
});

/**
 * Handle QR code scan for key return (security/admin only)
 */
export const qrScanReturn = asyncHandler(async (req, res) => {
  const { qrData } = req.body;

  if (!qrData) {
    throw new ValidationError("QR data is required");
  }

  // Parse QR data
  let parsedData;
  try {
    parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
  } catch (error) {
    throw new ValidationError("Invalid QR code format");
  }

  const { keyId, userId, returnId } = parsedData;

  if (!keyId || !userId || !returnId) {
    throw new ValidationError("Invalid QR code data - missing required fields");
  }

  // Find the key
  const key = await Key.findById(keyId);
  if (!key) {
    throw new NotFoundError("Key not found");
  }

  // Verify the key is currently taken by the specified user
  if (key.status === 'available') {
    throw new ConflictError("Key is already available");
  }

  if (!key.takenBy.userId || key.takenBy.userId.toString() !== userId) {
    throw new ValidationError("Key is not currently taken by the specified user");
  }

  // Get the original user who took the key
  const originalUser = await User.findById(userId);
  if (!originalUser) {
    throw new NotFoundError("Original user not found");
  }

  // Return the key
  await key.returnKey();

  // Emit real-time update for QR scan return
  emitQRScanReturn(key, req.userId, userId);

  res.status(200).json({
    success: true,
    message: `Key ${key.keyNumber} (${key.keyName}) returned successfully via QR scan`,
    data: {
      key,
      originalUser: {
        id: originalUser._id,
        name: originalUser.name,
        email: originalUser.email
      },
      scannedBy: {
        id: req.userId,
        name: req.userName || 'Security',
        role: req.userRole
      }
    },
  });
});

/**
 * Handle QR code scan for key request (security/admin only)
 */
export const qrScanRequest = asyncHandler(async (req, res) => {
  const { qrData } = req.body;

  if (!qrData) {
    throw new ValidationError("QR data is required");
  }

  // Parse QR data
  let parsedData;
  try {
    parsedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
  } catch (error) {
    throw new ValidationError("Invalid QR code format");
  }

  const { keyId, userId, requestId } = parsedData;

  if (!keyId || !userId || !requestId) {
    throw new ValidationError("Invalid QR code data - missing required fields");
  }

  // Find the key
  const key = await Key.findById(keyId);
  if (!key) {
    throw new NotFoundError("Key not found");
  }

  // Verify the key is available
  if (key.status === 'unavailable') {
    throw new ConflictError("Key is already taken");
  }

  // Get the user who requested the key
  const requestingUser = await User.findById(userId);
  if (!requestingUser) {
    throw new NotFoundError("Requesting user not found");
  }

  // Take the key for the requesting user
  await key.takeKey(requestingUser);

  // Emit real-time update for QR scan request
  emitQRScanRequest(key, req.userId, userId);

  res.status(200).json({
    success: true,
    message: `Key ${key.keyNumber} (${key.keyName}) assigned successfully via QR scan`,
    data: {
      key,
      requestingUser: {
        id: requestingUser._id,
        name: requestingUser.name,
        email: requestingUser.email
      },
      scannedBy: {
        id: req.userId,
        name: req.userName || 'Security',
        role: req.userRole
      }
    },
  });
});
