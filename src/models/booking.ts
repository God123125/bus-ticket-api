import { model, ObjectId, Schema } from "mongoose";
import { clientUserModel } from "./client-user";
import { IMongoObject } from "../interfaces/mongo-object";
import { tripModel } from "./trip";
export interface IBooking extends IMongoObject {
  user?: string | ObjectId;
  total_price: number;
  booked_seats: string[];
  trip: string | ObjectId;
  status?: string;
  user_info?: any;
  company?: string | ObjectId;
}
const schema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: clientUserModel.collection.collectionName,
      required: false,
    },
    total_price: { type: Schema.Types.Number, required: true },
    status: { type: Schema.Types.String, required: false, default: "PENDING" },
    booked_seats: [{ type: Schema.Types.String, required: false }],
    trip: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: tripModel.collection.collectionName,
    },
    user_info: { type: Schema.Types.Mixed, required: false },
    company: {
      type: Schema.Types.ObjectId,
      ref: "companies",
      required: false,
    },
  },
  { timestamps: true },
);
export const bookingModel = model("bookings", schema);
