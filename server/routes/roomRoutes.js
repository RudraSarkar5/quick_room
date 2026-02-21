import express from "express";
import { createOrLoginRoom, deleteRoom } from "../controllers/roomControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// Create new room or login
router.post("/", createOrLoginRoom);

// Delete a room with all delete
router.delete("/:roomId", authMiddleware, deleteRoom);



export default router;
