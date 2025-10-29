import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // صاحب المنتج (التاجر)
    },
    title: { type: String, required: true },
    slug: { type: String, index: true },
    description: { type: String },
    price: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "USD" },
    stock: { type: Number, default: 0 },
    images: [{ type: String }], // روابط الصور
    categories: [{ type: String }],
    attributes: { type: Object }, // خصائص مرنة (مثل اللون، المقاس)
    isPublished: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// 🔹 توليد slug من العنوان قبل الحفظ
productSchema.pre("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// 🔹 تحسين البحث والفهرسة
// ✅ فهرس عادي على category لتسريع البحث
productSchema.index({ categories: 1 });
productSchema.index({ title: "text", description: "text" });
productSchema.index({ merchant: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
