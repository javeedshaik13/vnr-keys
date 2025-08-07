import express from "express";
import {
  getAllKeys,
  getAvailableKeys,
  getUnavailableKeys,
  getMyTakenKeys,
  getFrequentlyUsedKeys,
  getKeyById,
  takeKey,
  returnKey,
  createKey,
  updateKey,
  deleteKey,
  toggleFrequentlyUsed,
} from "../controllers/key.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { rolePermissions } from "../middleware/roleAuth.js";

const router = express.Router();

// All key routes require authentication
router.use(verifyToken);

// GET routes - accessible to all authenticated users
router.get("/", getAllKeys); // Get all keys with optional filtering
router.get("/available", getAvailableKeys); // Get available keys
router.get("/unavailable", getUnavailableKeys); // Get unavailable keys
router.get("/my-taken", getMyTakenKeys); // Get keys taken by current user
router.get("/frequently-used", getFrequentlyUsedKeys); // Get frequently used keys
router.get("/:keyId", getKeyById); // Get single key by ID

// POST routes
router.post("/", rolePermissions.adminOnly, createKey); // Create new key (admin only)
router.post("/:keyId/take", rolePermissions.adminOrFaculty, takeKey); // Take a key (faculty/admin)
router.post("/:keyId/return", returnKey); // Return a key (any user can return their own key, security/admin can return any)
router.post("/:keyId/toggle-frequent", toggleFrequentlyUsed); // Toggle frequently used status

// PUT routes
router.put("/:keyId", rolePermissions.adminOnly, updateKey); // Update key (admin only)

// DELETE routes
router.delete("/:keyId", rolePermissions.adminOnly, deleteKey); // Delete key (admin only)

export default router;
