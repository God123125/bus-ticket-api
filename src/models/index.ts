import mongoose from "mongoose";
import "dotenv/config";
import { seedAdminUser } from "../utils/seed-admin";
let isConnected = false;

export async function connect() {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI!);

    isConnected = db.connections[0]!.readyState === 1;

    console.log("MongoDB Connected");
    await seedAdminUser();
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error;
  }
}
