import express from "express";
import {
  createDelivery,
  getMyDeliveries,
  getDeliveryById,
  deleteDelivery,
} from "../controllers/deliveryController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createDelivery);
router.get("/", protect, getMyDeliveries);
router.get("/:id", protect, getDeliveryById);
router.delete("/:id", protect, deleteDelivery);

export default router;
