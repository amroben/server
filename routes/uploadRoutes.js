import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// إعداد Multer لتخزين الملفات في مجلد "uploads"
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploadsproducts/"); // تأكد أن المجلد موجود
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/", upload.array("images"), (req, res) => {
  const urls = req.files.map(file => `http://localhost:5000/${file.path}`);
  res.json({ urls });
});

export default router;
