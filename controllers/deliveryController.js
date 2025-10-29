import Delivery from "../models/Delivery.js";

// 🟢 إضافة دليفري جديد
export const createDelivery = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { firstName, lastName, phone, city } = req.body;

    const delivery = await Delivery.create({
      merchant: merchantId,
      firstName,
      lastName,
      phone,
      city,
    });

    res.status(201).json({ success: true, delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 جلب كل الدليفري الخاص بالتاجر
export const getMyDeliveries = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const deliveries = await Delivery.find({ merchant: merchantId }).sort({ createdAt: -1 });
    res.json({ success: true, deliveries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 جلب دليفري واحد بالتفاصيل
export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

    if (delivery.merchant.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Access denied" });

    res.json({ success: true, delivery });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🟢 حذف دليفري
export const deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: "Delivery not found" });

    if (delivery.merchant.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Access denied" });

    await delivery.deleteOne();
    res.json({ success: true, message: "Delivery deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
