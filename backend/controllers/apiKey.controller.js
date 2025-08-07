import { ApiKey } from "../models/apiKey.model.js";
import { User } from "../models/user.model.js";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthorizationError,
  asyncHandler,
} from "../utils/errorHandler.js";

/**
 * Get all API keys (admin only - can see all departments)
 */
export const getAllApiKeys = asyncHandler(async (req, res) => {
  const { department, isActive, page = 1, limit = 10 } = req.query;
  
  // Build filter object
  const filter = {};
  if (department) filter.department = department;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  
  // Add expiration filter for active keys
  if (filter.isActive !== false) {
    filter.$or = [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  const [apiKeys, total] = await Promise.all([
    ApiKey.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    ApiKey.countDocuments(filter)
  ]);
  
  res.status(200).json({
    success: true,
    message: "API keys retrieved successfully",
    data: {
      apiKeys,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    },
  });
});

/**
 * Get API keys by department (admin can access all, others only their department)
 */
export const getApiKeysByDepartment = asyncHandler(async (req, res) => {
  const { department } = req.params;
  const userRole = req.userRole;
  
  // Validate department
  const validDepartments = ["CSE", "EEE", "AIML", "IoT", "ECE", "MECH", "CIVIL", "IT", "ADMIN", "RESEARCH"];
  if (!validDepartments.includes(department)) {
    throw new ValidationError("Invalid department specified");
  }
  
  // Non-admin users can only access their own department (if implemented in future)
  // For now, we'll allow all authenticated users to view department keys
  
  const apiKeys = await ApiKey.findByDepartment(department);
  
  res.status(200).json({
    success: true,
    message: `API keys for ${department} department retrieved successfully`,
    data: { apiKeys, department },
  });
});

/**
 * Get single API key by ID
 */
export const getApiKeyById = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  
  const apiKey = await ApiKey.findById(keyId).populate('createdBy', 'name email role');
  
  if (!apiKey) {
    throw new NotFoundError("API key not found");
  }
  
  res.status(200).json({
    success: true,
    message: "API key retrieved successfully",
    data: { apiKey },
  });
});

/**
 * Create a new API key (admin only)
 */
export const createApiKey = asyncHandler(async (req, res) => {
  const {
    keyId,
    keyName,
    department,
    description,
    permissions,
    expiresAt,
    rateLimit,
  } = req.body;
  
  // Validate required fields
  if (!keyId || !keyName || !department) {
    throw new ValidationError("keyId, keyName, and department are required");
  }
  
  // Check if keyId already exists
  const existingKey = await ApiKey.findOne({ keyId });
  if (existingKey) {
    throw new ConflictError("API key ID already exists");
  }
  
  // Create new API key
  const apiKey = new ApiKey({
    keyId,
    keyName,
    department,
    description,
    permissions,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    rateLimit,
    createdBy: req.userId,
    isStatic: false, // Admin-created keys are not static
  });
  
  await apiKey.save();
  
  // Populate the createdBy field for response
  await apiKey.populate('createdBy', 'name email role');
  
  res.status(201).json({
    success: true,
    message: "API key created successfully",
    data: { apiKey },
  });
});

/**
 * Update an API key (admin only)
 */
export const updateApiKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const {
    keyName,
    description,
    permissions,
    expiresAt,
    rateLimit,
    isActive,
  } = req.body;
  
  const apiKey = await ApiKey.findById(keyId);
  
  if (!apiKey) {
    throw new NotFoundError("API key not found");
  }
  
  // Update fields
  if (keyName !== undefined) apiKey.keyName = keyName;
  if (description !== undefined) apiKey.description = description;
  if (permissions !== undefined) apiKey.permissions = { ...apiKey.permissions, ...permissions };
  if (expiresAt !== undefined) apiKey.expiresAt = expiresAt ? new Date(expiresAt) : null;
  if (rateLimit !== undefined) apiKey.rateLimit = { ...apiKey.rateLimit, ...rateLimit };
  if (isActive !== undefined) apiKey.isActive = isActive;
  
  await apiKey.save();
  await apiKey.populate('createdBy', 'name email role');
  
  res.status(200).json({
    success: true,
    message: "API key updated successfully",
    data: { apiKey },
  });
});

/**
 * Delete an API key (admin only - can only delete static/hardcoded keys)
 */
export const deleteApiKey = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  
  const apiKey = await ApiKey.findById(keyId);
  
  if (!apiKey) {
    throw new NotFoundError("API key not found");
  }
  
  // Only allow deletion of static (seeded) keys
  if (!apiKey.isStatic) {
    throw new AuthorizationError("Only static (hardcoded) keys can be deleted");
  }
  
  await ApiKey.findByIdAndDelete(keyId);
  
  res.status(200).json({
    success: true,
    message: "API key deleted successfully",
    data: { deletedKeyId: keyId },
  });
});

/**
 * Toggle API key active status (admin only)
 */
export const toggleApiKeyStatus = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  
  const apiKey = await ApiKey.findById(keyId);
  
  if (!apiKey) {
    throw new NotFoundError("API key not found");
  }
  
  apiKey.isActive = !apiKey.isActive;
  await apiKey.save();
  await apiKey.populate('createdBy', 'name email role');
  
  res.status(200).json({
    success: true,
    message: `API key ${apiKey.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { apiKey },
  });
});

/**
 * Record API key usage (for tracking purposes)
 */
export const recordApiKeyUsage = asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  
  const apiKey = await ApiKey.findById(keyId);
  
  if (!apiKey) {
    throw new NotFoundError("API key not found");
  }
  
  if (!apiKey.isActive) {
    throw new AuthorizationError("API key is inactive");
  }

  if (apiKey.isExpired) {
    throw new AuthorizationError("API key has expired");
  }
  
  await apiKey.recordUsage();
  
  res.status(200).json({
    success: true,
    message: "API key usage recorded successfully",
    data: { 
      keyId: apiKey.keyId,
      usageCount: apiKey.usageCount,
      lastUsed: apiKey.lastUsed
    },
  });
});

/**
 * Get API key statistics (admin only)
 */
export const getApiKeyStats = asyncHandler(async (req, res) => {
  const stats = await ApiKey.aggregate([
    {
      $group: {
        _id: "$department",
        totalKeys: { $sum: 1 },
        activeKeys: { $sum: { $cond: ["$isActive", 1, 0] } },
        totalUsage: { $sum: "$usageCount" },
        staticKeys: { $sum: { $cond: ["$isStatic", 1, 0] } },
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  const overallStats = await ApiKey.aggregate([
    {
      $group: {
        _id: null,
        totalKeys: { $sum: 1 },
        activeKeys: { $sum: { $cond: ["$isActive", 1, 0] } },
        totalUsage: { $sum: "$usageCount" },
        staticKeys: { $sum: { $cond: ["$isStatic", 1, 0] } },
        expiredKeys: { 
          $sum: { 
            $cond: [
              { $and: [
                { $ne: ["$expiresAt", null] },
                { $lt: ["$expiresAt", new Date()] }
              ]},
              1, 
              0
            ]
          }
        }
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    message: "API key statistics retrieved successfully",
    data: {
      departmentStats: stats,
      overallStats: overallStats[0] || {
        totalKeys: 0,
        activeKeys: 0,
        totalUsage: 0,
        staticKeys: 0,
        expiredKeys: 0
      }
    },
  });
});
