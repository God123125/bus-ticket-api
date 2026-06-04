import { model, ObjectId, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";
import { busModel } from "./bus";
export interface IBusTrip extends IMongoObject {
  bus: string | ObjectId;
  seats_layout: Seat[];
}
interface Seat {
  seat_no: string;
  status: string;
  col: number;
  row: number;
}
const schema = new Schema<IBusTrip>(
  {
    bus: {
      type: Schema.Types.ObjectId,
      ref: busModel.collection.collectionName,
      required: true,
    },
    seats_layout: [
      {
        seat_no: { type: Schema.Types.String, required: true },
        status: { type: Schema.Types.String, required: true },
        row: { type: Schema.Types.Number, required: true },
        col: { type: Schema.Types.Number, required: true },
      },
    ],
  },
  { timestamps: true },
);
export const busTripModel = model("bus_trips", schema);
