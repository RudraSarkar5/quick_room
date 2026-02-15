import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    type: {
      type: String,
      enum: ["text", "file"],
      required: true,
    },

    // For text messages
    text: {
      type: String,
    },

    // For file uploads
    fileName: {
      type: String,
    },

    filePath: {
      type: String,
    },

    fileType: {
      type: String,
    },

    fileSize: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Content = mongoose.model("Content", contentSchema);

export default Content;
