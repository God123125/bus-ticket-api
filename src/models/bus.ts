import { model, ObjectId, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";
import { companyModel } from "./company";
export interface IBusImage {
  url: string;
  publicId: string;
}

export interface IBus extends IMongoObject {
  model_name: string;
  plate_number: string;
  description: string;
  type: string;
  company: string | ObjectId;
  images?: IBusImage[];
}
const schema = new Schema<IBus>(
  {
    model_name: { type: Schema.Types.String, required: true },
    plate_number: { type: Schema.Types.String, required: true },
    description: { type: Schema.Types.String, required: false },
    type: { type: Schema.Types.String, required: false },
    company: { type: Schema.Types.ObjectId, required: true },
    images: [
      {
        url: { type: Schema.Types.String, required: true },
        publicId: { type: Schema.Types.String, required: true },
      },
    ],
  },
  { timestamps: true },
);
export const busModel = model("buses", schema);
