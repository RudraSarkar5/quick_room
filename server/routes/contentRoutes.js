import express from "express";
import {
  uploadText,
  uploadFile,
  getRoomContents,
  deleteContent,
} from "../controllers/contentControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js"

const router = express.Router();


// Upload text content
router.post("/text", authMiddleware, uploadText);

// Upload file content
router.post("/file", authMiddleware, uploadFile);

// Get all content of the room
router.get("/", authMiddleware, getRoomContents);

//Delete content by Id
router.delete("/:id", authMiddleware, deleteContent);

export default router;
