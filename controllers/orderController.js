import Order from "../models/Order.js";
import Delivery from "../models/Delivery.js";

// 🟢 إنشاء طلب جديد
export const createOrder = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const order = new Order({ ...req.body, merchant: merchantId });
    await order.save();
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 جلب جميع طلبات التاجر الحالي
export const getMyOrders = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const orders = await Order.find({ merchant: merchantId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 جلب طلب واحد
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 تحديث حالة الطلب أو بياناته
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    if (order.merchant.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Access denied" });

    const { status, deliveryName } = req.body;

    // ✅ تحقق من وجود اسم دليفري إذا كانت الحالة shipping
    if (status === "shipping" && order.orderType === "delivery" && !order.deliveryName && !deliveryName) {
      return res.status(400).json({
        success: false,
        message: "Please select a delivery person before setting status to 'shipping'.",
      });
    }

    // ✅ إذا تم تحديث الحالة إلى shipping أضف تاريخ الشحن
    if (status === "shipping" && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    // ✅ حدّث القيم الجديدة
    if (status) order.status = status;
    if (deliveryName) order.deliveryName = deliveryName;

    await order.save();

    // ✅ تحديث عدادات الدليفري (إن وجد)
    if (order.deliveryName && (status === "completed" || status === "cancelled")) {
      // نبحث عن الدليفري بالاسم الكامل داخل نفس التاجر
      const delivery = await Delivery.findOne({
        merchant: order.merchant,
        $expr: {
          $eq: [
            { $concat: ["$firstName", " ", "$lastName"] },
            order.deliveryName,
          ],
        },
      });

      if (delivery) {
        if (status === "completed") delivery.completedCount += 1;
        if (status === "cancelled") delivery.cancelledCount += 1;
        await delivery.save();
      }
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// 🟢 حذف طلب
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.merchant.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Access denied" });

    await order.deleteOne();
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
