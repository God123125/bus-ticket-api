import { model, ObjectId, Schema } from "mongoose";

export interface SeatHold {
  user?: string | ObjectId;
  total_price: number;
  booked_seats: string[];
  trip: string | ObjectId;
  status?: string;
  user_info?: any;
  company?: string | ObjectId;
  expireAt: Date;
}

const schema = new Schema<SeatHold>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    total_price: { type: Schema.Types.Number, required: true },
    status: { type: Schema.Types.String, required: false, default: "pending" },
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
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from creation
      expires: 0, // delete as soon as expireAt is reached
    },
  },
  { timestamps: true },
);
schema.index({ createdAt: 1 }, { expireAfterSeconds: 300 }); // 5 min after createdAt
export const seatHoldModel = model<SeatHold>("seat-holds", schema);
