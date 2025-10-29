import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // التاجر الذي يملك الطلب
    },

    // 🟢 نوع الطلب: حجز أو توصيل
    orderType: {
      type: String,
      enum: ["booking", "delivery"],
      required: true,
      default: "delivery",
    },

    // 🟣 تفاصيل المنتج
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },

    // 🧍‍♂️ تفاصيل الزبون
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },

    // 🚚 اسم صاحب الدليفري (يدخله التاجر لاحقًا)
    deliveryName: { type: String},

    // 🔁 الحالة
    status: {
      type: String,
      enum: ["prepared", "shipping", "cancelled", "completed"],
      default: "prepared",
    },

    shippedAt: { type: Date }, // تاريخ الشحن (عند تغيير الحالة إلى shipping)
  },
  { timestamps: true }
);

// ✅ شرط ذكي: لا يمكن تعيين الحالة إلى "shipping" بدون اسم دليفري
orderSchema.pre("save", function (next) {
  if (this.status === "shipping" && this.orderType === "delivery" && !this.deliveryName) {
    const err = new Error("Delivery name is required before setting status to 'shipping'");
    return next(err);
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
