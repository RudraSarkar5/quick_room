import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    key: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
