import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const adminAuth = async (req, res, next) => {
  let token;

  // التحقق من وجود التوكن في الهيدر
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);

      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "ممنوع: Admin فقط" });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "توكن غير صالح" });
    }
  } else {
    return res.status(401).json({ message: "توكن غير موجود" });
  }
};
