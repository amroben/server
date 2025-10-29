import jwt from "jsonwebtoken";
import User from "../models/User.js";

// توليد التوكن

export  const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};
// تسجيل مستخدم جديد
export const register = async (req, res) => {

  try {
    const { name, email, password, role, providerType, phone, birthdate } = req.body;
  console.log("📦 Incoming body:", req.body);

    // 🚫 منع أي تسجيل Admin من هنا
    if (role === "admin") {
      return res.status(403).json({ message: "لا يمكنك إنشاء حساب Admin مباشرة." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "البريد الإلكتروني مسجل بالفعل" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      providerType: role === "provider" ? providerType : "",
      phone,
      birthdate,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        providerType: user.providerType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في الخادم", error: error.message });
    console.error("❌ Register Error:", error);

  }
};

// تسجيل الدخول
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "بيانات الاعتماد غير صحيحة" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "بيانات الاعتماد غير صحيحة" });

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        providerType: user.providerType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في الخادم", error: error.message });
  }
};

// جلب بيانات المستخدم
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في الخادم", error: error.message });
  }
};
