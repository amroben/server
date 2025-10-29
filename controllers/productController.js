import Product from "../models/Product.js";
import fs from "fs";
import path from "path";

// 🟢 إنشاء منتج جديد
export const createProduct = async (req, res) => {
  try {
    const merchantId = req.user.id; // من JWT middleware
    const product = new Product({ ...req.body, merchant: merchantId });
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 جلب جميع منتجات التاجر الحالي
export const getMyProducts = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const products = await Product.find({ merchant: merchantId }).sort({ createdAt: -1 });
    res.json({ success: true, products })
;
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 جلب منتج واحد بالتفصيل
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("merchant", "name email");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 تعديل منتج
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (product.merchant.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Access denied" });

    // 🔹 دمج الصور القديمة والجديدة فقط إذا تم رفع ملفات جديدة
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `http://localhost:5000/uploadsproduct/${file.filename}`);
      product.images = [...product.images, ...newImages]; // دمج القديم والجديد
    }

    // تحديث باقي بيانات المنتج
    Object.assign(product, req.body);
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// 🟢 حذف منتج
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (product.merchant.toString() !== req.user.id)
      return res
        .status(403)
        .json({ success: false, message: "Access denied" });

    // 🔹 حذف الصور المرتبطة بالمنتج
product.images.forEach((imgUrl) => {
  // إزالة الـ base URL إذا موجود
  let relativePath = imgUrl.replace("http://localhost:5000/", "");
  const filepath = path.resolve(relativePath); // الآن المسار كامل

  if (fs.existsSync(filepath)) {
    fs.unlink(filepath, (err) => {
      if (err) console.error("Error deleting file:", err);
      else console.log("Deleted file:", filepath);
    });
  } else {
    console.log("File does not exist, skipping:", filepath);
  }
});


    // حذف المنتج من قاعدة البيانات
    await product.deleteOne();

    res.json({ success: true, message: "Product and images deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟣 حذف صورة واحدة فعليًا من المجلد والـ DB
export const removeProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    if (product.merchant.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    const { imageUrl } = req.body;
    if (!imageUrl)
      return res.status(400).json({ success: false, message: "Missing imageUrl" });

    // 🧠 حساب المسار الفعلي
    let filePath;
    if (imageUrl.startsWith("http://localhost:5000/")) {
      const relative = imageUrl.replace("http://localhost:5000/", "");
      filePath = path.resolve(process.cwd(), relative);
    } else if (imageUrl.startsWith("/uploadsproducts/")) {
      filePath = path.resolve(process.cwd(), "." + imageUrl);
    } else {
      filePath = path.resolve(process.cwd(), "backend/uploadsproducts", imageUrl);
    }

    // 🗑️ حذف فعلي من القرص إن وُجد
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log("🗑️ Deleted file:", filePath);
      } else {
        console.warn("⚠️ File not found:", filePath);
      }
    } catch (err) {
      console.warn("⚠️ Error deleting:", err.message);
    }

    // 🔹 حذف الصورة من قاعدة البيانات
    product.images = product.images.filter((img) => img !== imageUrl);
    await product.save();

    res.json({ success: true, product });
  } catch (err) {
    console.error("❌ removeProductImage Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
