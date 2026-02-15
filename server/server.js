import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import roomRoutes from "./routes/roomRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import { startRoomExpiryJob } from "./jobs/roomExpiryJob.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

//Middlewares
// Allow only your frontend to access the API
const allowedOrigins = [process.env.CLIENT_URL]; 

app.use(cors({
  origin: function(origin, callback){
    // Allow requests with no origin (like Postman)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true // if using cookies/auth
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

//Routes
app.use("/api/v1/rooms", roomRoutes);
app.use("/api/v1/contents", contentRoutes);


//Server health check
app.get("/health", (req, res) => {
  res.json({ message: "Quick Share API is running 🚀" });
});



//Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack);

  // Default fallback for unknown errors
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});



//  MongoDB Connection + Server Start
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected!");

    //Start cron job AFTER DB connection
    startRoomExpiryJob();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();


//Server shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received: shutting down gracefully...`);
  server.close(async () => {
    console.log("HTTP server closed");
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  });

  // Force exit if not closed in 10s
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

// Signals for  shutdown
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Catch unhandled exceptions & rejections
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});