import { model, Schema } from "mongoose";
export interface IBus {
  bus_name: string;
  plate_number: string;
  description: string;
  type: string;
}
const schema = new Schema<IBus>(
  {
    bus_name: { type: Schema.Types.String, required: true },
    plate_number: { type: Schema.Types.String, required: true },
    description: { type: Schema.Types.String, required: false },
    type: { type: Schema.Types.String, required: false },
  },
  { timestamps: true },
);
export const busModel = model("buses", schema);
