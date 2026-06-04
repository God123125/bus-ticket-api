import { model, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";
export interface IBus extends IMongoObject {
  bus_name: string;
  plate_number: string;
  description: string;
  type: string;
  seat_layout: Seat[];
}
interface Seat {
  seat_no: string;
  col: number;
  row: number;
}
const schema = new Schema<IBus>(
  {
    bus_name: { type: Schema.Types.String, required: true },
    plate_number: { type: Schema.Types.String, required: true },
    description: { type: Schema.Types.String, required: false },
    type: { type: Schema.Types.String, required: false },
    seat_layout: [
      {
        seat_no: { type: Schema.Types.String, required: true },
        row: { type: Schema.Types.Number, required: true },
        col: { type: Schema.Types.Number, required: true },
      },
    ],
  },
  { timestamps: true },
);
export const busModel = model("buses", schema);
