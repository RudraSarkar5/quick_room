import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";

export const deleteFileFromStorage = async (filePath) => {
  if (!filePath) return;

  const absolutePath = path.resolve(filePath);

  // 🔐 Security: Ensure file is inside upload directory
  if (!absolutePath.includes(UPLOAD_DIR)) {
    console.warn("Attempted invalid file deletion:", absolutePath);
    return;
  }

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("File deletion error:", error.message);
    }
  }
};
