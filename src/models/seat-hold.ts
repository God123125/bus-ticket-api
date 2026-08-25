import { model, ObjectId, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";

export interface ISeatHold extends IMongoObject {
  user?: string | ObjectId;
  total_price: number;
  booked_seats: string[];
  trip: string | ObjectId;
  user_info?: any;
  company?: string | ObjectId;
  expireAt: Date;
}

const schema = new Schema<ISeatHold>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    total_price: { type: Schema.Types.Number, required: true },
    booked_seats: [{ type: Schema.Types.String, required: false }],
    trip: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "trips",
    },
    user_info: { type: Schema.Types.Mixed, required: false },
    company: {
      type: Schema.Types.ObjectId,
      ref: "companies",
      required: false,
    },
    expireAt: {
      type: Schema.Types.Date,
      required: false,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 5 minutes from creation
    },
  },
  { timestamps: true },
);
schema.index({ expireAt: 1 }, { expireAfterSeconds: 0 }); // 5 min after createdAt
export const seatHoldModel = model<ISeatHold>("seat-holds", schema);
