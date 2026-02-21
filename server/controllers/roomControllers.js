import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Room from "../models/Room.js";
import Content from "../models/Content.js";
import fs from "fs";
import path from "path";

// Generate JWT
const generateToken = (room) => {
  return jwt.sign(
    { roomId: room.roomId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

//create a room or login into room
export const createOrLoginRoom = async (req, res) => {
  try {
     console.log("inside room ")
    const { roomId, key } = req.body;

    if (!roomId || !key) {
      return res.status(400).json({
        success: false,
        message: "Room ID and key are required",
      });
    }
   

    let room = await Room.findOne({ roomId });

    // Room exist
    if (room) {
      const isMatch = await bcrypt.compare(key, room.key);

      // Key not matching
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Room already exists but key is not matching",
        });
      }

      // Room + Key matched
      const token = generateToken(room);

      return res.status(200).json({
        success: true,
        message: "Welcome to room",
        token,
      });
    }

    // New room
    const hashedKey = await bcrypt.hash(key, 10);

    room = await Room.create({
      roomId,
      key: hashedKey,
    });

    const token = generateToken(room);

    return res.status(201).json({
      success: true,
      message: "New room created",
      token,
    });

  } catch (error) {
    console.error("Room create/login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// Delete room with all content
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Find all contents for this room
    const contents = await Content.find({ room: room._id });

    // Delete uploaded files from storage
    contents.forEach((item) => {
      if (item.type === "file" && item.filePath) {
        const fileFullPath = path.join(process.cwd(), item.filePath);
        fs.unlink(fileFullPath, (err) => {
          if (err) {
            console.error(`Failed to delete file: ${fileFullPath}`, err.message);
          } else {
            console.log(`Deleted file: ${fileFullPath}`);
          }
        });
      }
    });

    // Delete all contents from DB
    await Content.deleteMany({ room: room._id });

    // Delete room
    await Room.deleteOne({ _id: room._id });

    res.status(200).json({
      success: true,
      message: "Room and all contents (including files) deleted successfully",
    });

  } catch (error) {
    console.error("Room deletion failed:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


