import cron from "node-cron";
import Room from "../models/Room.js";
import { deleteRoomWithContents } from "../services/roomCleanupService.js";

//Job will start in every 1 hour
export const startRoomExpiryJob = () => {
  const expiryDays = Number(process.env.ROOM_EXPIRY_DAYS);

  if (!expiryDays || isNaN(expiryDays)) {
    console.error("Invalid ROOM_EXPIRY_DAYS in .env");
    return;
  }

  
  // Run every 1 hour
  cron.schedule("0 * * * *", async () => {
    const now = new Date();

    const expiryCutoff = new Date(
      now.getTime() - expiryDays * 24 * 60 * 60 * 1000
    );



    try {
      const expiredRooms = await Room.find(
        { createdAt: { $lte: expiryCutoff } },
        { roomId: 1 }
      ).lean();


      console.log(`Found ${expiredRooms.length} expired rooms.`);

      for (const room of expiredRooms) {
        try {
          await deleteRoomWithContents(room.roomId);
          console.log(`Deleted room: ${room.roomId}`);
        } catch (err) {
          console.error(
            `Failed to delete room ${room.roomId}:`,
            err.message
          );
        }
      }
    } catch (error) {
      console.error("Expiry job failed:", error.message);
    }
  });
};
