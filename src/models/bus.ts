import { model, ObjectId, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";
export interface IBus extends IMongoObject {
  bus_name: string;
  plate_number: string;
  description: string;
  type: string;
  company: string | ObjectId;
}
const schema = new Schema<IBus>(
  {
    bus_name: { type: Schema.Types.String, required: true },
    plate_number: { type: Schema.Types.String, required: true },
    description: { type: Schema.Types.String, required: false },
    type: { type: Schema.Types.String, required: false },
    company: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
);
export const busModel = model("buses", schema);
