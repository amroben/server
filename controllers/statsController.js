import User from "../models/User.js";

// ✅ تصفير الإحصائيات
export const resetStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.lastStatsReset = new Date();
    await user.save();

    res.json({
      success: true,
      message: "Stats reset successfully",
      lastStatsReset: user.lastStatsReset,
    });
  } catch (error) {
    console.error("Reset stats error:", error);
    res.status(500).json({ success: false, message: "Server error resetting stats" });
  }
};
