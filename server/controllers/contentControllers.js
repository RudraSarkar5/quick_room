import Content from "../models/Content.js";
import Room from "../models/Room.js";
import { deleteFileFromStorage } from "../utils/storage.js";
import { deleteFromS3 } from "./s3Controller.js";

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




export const uploadFile = async (req, res) => {
  try {
    const { fileName, filePath, fileType, fileSize } = req.body || {};

    // 1) Validate input from frontend
    if (!fileName || !filePath) {
      return res.status(400).json({
        success: false,
        message: "fileName and filePath are required",
      });
    }

    // 2) Resolve the user's room (assuming req.user.roomId is set by your auth middleware)
    if (!req.user?.roomId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: roomId missing on user context",
      });
    }

    const room = await Room.findOne({ roomId: req.user.roomId });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // 3) Persist content metadata (S3 key is stored in filePath)
    const content = await Content.create({
      room: room._id,
      type: "file",
      fileName,
      filePath,     // S3 key like "uploads/1700000000000-myfile.png"
      fileType: fileType || null,
      fileSize: fileSize || null,
    });

    // (Optional) If you want to return a GET URL (unsigned) for viewing:
    // const region = process.env.AWS_REGION;
    // const bucket = process.env.S3_BUCKET_NAME;
    // const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${filePath}`;

    return res.status(201).json({
      success: true,
      message: "File metadata saved",
      content,
      // publicUrl, // uncomment if you want to return it
    });
  } catch (error) {
    console.error("Upload file error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ========== UPLOAD FILE ========== */
// export const uploadFile = async (req, res) => {
//   try {


//     const room = await Room.findOne({ roomId: req.user.roomId });
//     if (!room) {
//       return res.status(404).json({
//         success: false,
//         message: "Room not found",
//       });
//     }

//     const content = await Content.create({
//       room: room._id,
//       type: "file",
//       fileName: req.file.originalname,
//       filePath: `uploads/${req.file.filename}`,
//       fileType: req.file.mimetype,
//       fileSize: req.file.size,
//     });

//     res.status(201).json({
//       success: true,
//       message: "File uploaded successfully",
//       content,
//     });
//   } catch (error) {
//     console.error("Upload file error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

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
      console.log("what is wrong ")
      await deleteFromS3(content.filePath);
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
