import express from "express";
import {
	getAdminDashboard,
	getOperatorDashboard,
	getResponderDashboard,
	getUserProfile
} from "../controllers/dashboard.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { rolePermissions } from "../middleware/roleAuth.js";

const router = express.Router();

// All dashboard routes require authentication
router.use(verifyToken);

// Role-specific dashboard endpoints
router.get("/admin", rolePermissions.adminOnly, getAdminDashboard);
router.get("/operator", rolePermissions.adminOrOperator, getOperatorDashboard);
router.get("/responder", rolePermissions.adminOrResponder, getResponderDashboard);

// General user profile endpoint (accessible to all authenticated users)
router.get("/profile", getUserProfile);

export default router;
