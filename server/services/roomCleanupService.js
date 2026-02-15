import Room from "../models/Room.js";
import Content from "../models/Content.js";
import { deleteFileFromStorage } from "../utils/storage.js";

export const deleteRoomWithContents = async (roomId) => {
  try {
    const room = await Room.findOne({ roomId });

    if (!room) {
      console.log(`Room ${roomId} not found.`);
      return;
    }

    // Get contents first (needed for file deletion)
    const contents = await Content.find({ room: room._id });

    // 1️⃣ Delete DB content
    await Content.deleteMany({ room: room._id });

    // 2️⃣ Delete room
    await Room.deleteOne({ _id: room._id });

    console.log(`Room ${roomId} and DB contents deleted.`);

    // 3️⃣ Delete files AFTER DB deletion
    await Promise.all(
      contents
        .filter((item) => item.type === "file")
        .map((item) => deleteFileFromStorage(item.filePath))
    );

    console.log(`Files for room ${roomId} deleted.`);
  } catch (error) {
    console.error("Room deletion error:", error);
    throw error;
  }
};
