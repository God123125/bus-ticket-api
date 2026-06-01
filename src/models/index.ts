import mongoose from "mongoose";
import "dotenv/config";
export const connect = () => {
  mongoose
    .connect(process.env.MONGO_URI!)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error(err));
};
