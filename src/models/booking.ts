import { model, ObjectId, Schema } from "mongoose";
import { clientUserModel } from "./client-user";
import { IMongoObject } from "../interfaces/mongo-object";
export interface IBooking extends IMongoObject {
  user: string | ObjectId;
  total_price: number;
  booked_seats: string[];
  bus_type: string;
  trip: string | ObjectId;
}
const schema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: clientUserModel.collection.collectionName,
      required: true,
    },
    total_price: { type: Schema.Types.Number, required: true },
    booked_seats: [{ type: Schema.Types.String, required: false }],
    bus_type: { type: Schema.Types.String, required: true },
    trip: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
);
export const bookingModel = model("bookings", schema);
