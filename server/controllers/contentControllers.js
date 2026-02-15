import Content from "../models/Content.js";
import Room from "../models/Room.js";
import { deleteFileFromStorage } from "../utils/storage.js";

/* ========== UPLOAD TEXT ========== */
export const uploadText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    const room = await Room.findOne({ roomId: req.user.roomId });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const content = await Content.create({
      room: room._id,
      type: "text",
      text,
    });

    res.status(201).json({
      success: true,
      message: "Text uploaded successfully",
      content,
    });
  } catch (error) {
    console.error("Upload text error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ========== UPLOAD FILE ========== */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const room = await Room.findOne({ roomId: req.user.roomId });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const content = await Content.create({
      room: room._id,
      type: "file",
      fileName: req.file.originalname,
      filePath: `uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      content,
    });
  } catch (error) {
    console.error("Upload file error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ========== GET ALL CONTENTS FOR ROOM ========== */
export const getRoomContents = async (req, res) => {
  try {
    
    const room = await Room.findOne({ roomId: req.user.roomId });
    console.log("the room is : ",room)
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const contents = await Content.find({ room: room._id }).sort({
      createdAt: -1,
    });
    console.log(" vaue is ", contents )

    res.status(200).json({
      success: true,
      contents,
    });
  } catch (error) {
    console.error("Get room contents error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ========== DELETE CONTENT BY ID ========== */
export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findOne({ roomId: req.user.roomId });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Check ownership
    if (content.room.toString() !== room._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Delete file from storage if file type
    if (content.type === "file" && content.filePath) {
      await deleteFileFromStorage(content.filePath);
    }

    await Content.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Delete content error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
