import { model, ObjectId, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";
import { companyModel } from "./company";
export interface IBus extends IMongoObject {
  model_name: string;
  plate_number: string;
  description: string;
  type: string;
  company: string | ObjectId;
  row: number;
}
const schema = new Schema<IBus>(
  {
    model_name: { type: Schema.Types.String, required: true },
    plate_number: { type: Schema.Types.String, required: true },
    description: { type: Schema.Types.String, required: false },
    type: { type: Schema.Types.String, required: false },
    company: { type: Schema.Types.ObjectId, required: true },
    row: {
      type: Schema.Types.Number,
      required: true,
      ref: companyModel.collection.collectionName,
    },
  },
  { timestamps: true },
);
export const busModel = model("buses", schema);
