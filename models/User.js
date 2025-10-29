import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "الاسم مطلوب"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "البريد الإلكتروني مطلوب"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "كلمة المرور مطلوبة"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "consumer", "provider"],
      default: "consumer",
    },
    providerType: {
      type: String,
      enum: ["merchant", "craftsman", "services", ""],
      default: "",
    },
    phone: {
      type: String,
      unique: true,
      trim: true,
    },
    birthdate: {
      type: Date,
    },lastStatsReset: { type: Date, default: null }
  },

  { timestamps: true },

);

// تشفير كلمة المرور قبل الحفظ
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// التحقق من كلمة المرور
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
