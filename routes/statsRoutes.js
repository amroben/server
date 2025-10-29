import express from "express";
import { resetStats } from "../controllers/statsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ تصفير الإحصائيات
router.patch("/reset", protect, resetStats);

export default router;
