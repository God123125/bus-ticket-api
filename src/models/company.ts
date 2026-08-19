import { model, ObjectId, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";
export interface ICompany extends IMongoObject {
  name: string;
  rating: number;
  is_active: boolean;
  image: string;
  imagePublicId: string;
  owner: string | ObjectId;
  commission_rate: number;
  color: string;
  khqrImage?: string;
  khqrImagePublicId?: string;
}
const schema: Schema<ICompany> = new Schema<ICompany>(
  {
    name: { type: Schema.Types.String, required: true },
    rating: { type: Schema.Types.Number, default: 0, required: false },
    is_active: { type: Schema.Types.Boolean, default: true, required: false },
    image: { type: Schema.Types.String, required: false },
    imagePublicId: { type: Schema.Types.String, required: false },
    commission_rate: { type: Schema.Types.Number, default: 0, required: true },
    color: { type: Schema.Types.String, required: false },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    khqrImage: { type: Schema.Types.String, required: false },
    khqrImagePublicId: { type: Schema.Types.String, required: false },
  },
  { timestamps: true },
);
export const companyModel = model("companies", schema);
