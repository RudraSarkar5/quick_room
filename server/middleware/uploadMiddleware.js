import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 1MB
});

// Middleware wrapper to catch multer errors
export const uploadSingleFile = (fieldName) => (req, res, next) => {
  const uploader = upload.single(fieldName);
  uploader(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "File too large. Max 10 MB allowed." });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

export default upload;
