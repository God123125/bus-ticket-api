import { model, ObjectId, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";
import { busModel } from "./bus";
import { companyModel } from "./company";
import { scheduleModel } from "./schedule-destination";
export interface ITrip extends IMongoObject {
  bus: string | ObjectId;
  company: string | ObjectId;
  schedule: string | ObjectId;
  departure_date: Date;
  price_per_seat: number;
  amenities: string[]; // ["TV", "USB", "Wifi"]
  booked_seats: string[];
  status: string;
  discount?: number;
}
const schema = new Schema<ITrip>(
  {
    bus: {
      type: Schema.Types.ObjectId,
      ref: busModel.collection.collectionName,
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: companyModel.collection.collectionName,
      required: true,
    },
    schedule: {
      type: Schema.Types.ObjectId,
      ref: scheduleModel.collection.collectionName,
      required: true,
    },
    departure_date: {
      type: Schema.Types.Date,
      required: true,
    },
    price_per_seat: {
      type: Schema.Types.Number,
      required: true,
    },
    amenities: [
      {
        type: Schema.Types.String,
        required: false,
      },
    ],
    booked_seats: [{ type: Schema.Types.String, required: false }],
    status: {
      type: Schema.Types.String,
      enum: ["active", "inactive"],
      default: "active",
    },
    discount: {
      type: Schema.Types.Number,
      default: 0,
    },
  },
  { timestamps: true },
);
export const tripModel = model("trips", schema);
