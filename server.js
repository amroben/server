import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import orderRoutes from "./routes/orderRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

dotenv.config();
const app = express();

// ✅ إعدادات CORS (السماح للـ frontend على Vercel + localhost)
const allowedOrigins = [
  "http://localhost:3000",
  "https://frontend-kappa-lyart-98.vercel.app", // ✅ بدون /
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ لتحديد المسار الحالي
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ تحليل JSON
app.use(express.json());

// ✅ الاتصال بقاعدة البيانات
connectDB()
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ المسارات
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/uploadsproducts", express.static(path.join(__dirname, "uploadsproducts")));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", statsRoutes);

// ✅ المسار الافتراضي
app.get("/", (req, res) => {
  res.send("🚀 Super App Backend Running");
});

// ✅ تشغيل السيرفر
// ✅ تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://127.0.0.1:${PORT}`);
});

