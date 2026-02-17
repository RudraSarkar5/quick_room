import express from "express";
import { generateUploadUrl } from "../controllers/s3Controller.js";

const router = express.Router();

// Generate pre-signed URL for S3 upload
router.post("/upload-url", generateUploadUrl);

export default router;
