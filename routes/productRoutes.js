import express from "express";
import fs from "fs";
import path from "path";


import {
  createProduct,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { removeProductImage } from "../controllers/productController.js";

const router = express.Router();

// كل العمليات تتطلب أن يكون المستخدم Provider (merchant)
router.post("/", protect, createProduct);
router.get("/", protect, getMyProducts);
router.get("/:id", protect, getProductById);
// 🟣 حذف صورة واحدة فقط من منتج
router.patch("/:id/remove-image", protect, removeProductImage);

// دعم PUT و PATCH لتحديث المنتج
router.put("/:id", protect, updateProduct);
router.patch("/:id", protect, updateProduct);

router.delete("/:id", protect, deleteProduct);

export default router;
