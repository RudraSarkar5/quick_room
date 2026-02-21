import express from "express";
import {
  uploadText,
  uploadFile,
  getRoomWithContents,
  deleteContent,
} from "../controllers/contentControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();


// Upload text content
router.post("/text", authMiddleware, uploadText);

// Upload file content
router.post("/file", authMiddleware, uploadFile);

// Get all content of the room
router.get("/", authMiddleware, getRoomWithContents);

//Delete content by Id
router.delete("/:id", authMiddleware, deleteContent);

export default router;
