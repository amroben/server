import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id", protect, updateOrder);
router.patch("/:id", protect, updateOrder);
router.delete("/:id", protect, deleteOrder);

export default router;
