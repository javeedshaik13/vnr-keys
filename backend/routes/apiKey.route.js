import express from "express";
import {
  getAllApiKeys,
  getApiKeysByDepartment,
  getApiKeyById,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  toggleApiKeyStatus,
  recordApiKeyUsage,
  getApiKeyStats,
} from "../controllers/apiKey.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { rolePermissions } from "../middleware/roleAuth.js";
import { apiKeyPermissions } from "../middleware/apiKeyAuth.js";

const router = express.Router();

// All API key routes require authentication
router.use(verifyToken);

// GET routes
router.get("/", ...apiKeyPermissions.adminOnly, getAllApiKeys); // Get all API keys (admin only)
router.get("/stats", ...apiKeyPermissions.adminOnly, getApiKeyStats); // Get API key statistics (admin only)
router.get("/department/:department", ...apiKeyPermissions.authenticated, getApiKeysByDepartment); // Get keys by department (authenticated users)
router.get("/:keyId", ...apiKeyPermissions.authenticated, getApiKeyById); // Get single API key by ID (authenticated users)

// POST routes
router.post("/", ...apiKeyPermissions.adminOnly, createApiKey); // Create new API key (admin only)
router.post("/:keyId/usage", ...apiKeyPermissions.authenticated, recordApiKeyUsage); // Record API key usage (authenticated users)
router.post("/:keyId/toggle-status", ...apiKeyPermissions.adminOnly, toggleApiKeyStatus); // Toggle API key status (admin only)

// PUT routes
router.put("/:keyId", ...apiKeyPermissions.adminOrOwner, updateApiKey); // Update API key (admin or owner)

// DELETE routes
router.delete("/:keyId", ...apiKeyPermissions.adminOnly, deleteApiKey); // Delete API key (admin only - static keys only)

export default router;
