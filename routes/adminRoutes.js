import express from "express";
import User from "../models/User.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { generateToken } from "../controllers/authController.js";

const router = express.Router();

// إنشاء Admin جديد بواسطة Admin موجود
router.post("/create-admin", adminAuth, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "البريد الإلكتروني مسجل بالفعل" });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    const token = generateToken(admin._id, admin.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في الخادم", error: error.message });
  }
});

export default router;
