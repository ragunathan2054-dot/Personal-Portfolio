import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    // Stop the server on a failed DB connection on purpose — a server that
    // "runs" but silently fails every write is worse than one that never starts.
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}