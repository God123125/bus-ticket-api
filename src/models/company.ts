import { model, ObjectId, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";
import { userModel } from "./users";
export interface ICompany extends IMongoObject {
  name: string;
  rating: number;
  is_active: boolean;
  image: string;
  imagePublicId: string;
  owner: string | ObjectId;
}
const schema = new Schema<ICompany>(
  {
    name: { type: Schema.Types.String, required: true },
    rating: { type: Schema.Types.Number, default: 0, required: false },
    is_active: { type: Schema.Types.Boolean, default: true, required: false },
    image: { type: Schema.Types.String, required: false },
    imagePublicId: { type: Schema.Types.String, required: false },
    owner: {
      type: Schema.Types.ObjectId,
      ref: userModel.collection.collectionName,
      required: true,
    },
  },
  { timestamps: true },
);
export const companyModel = model("companies", schema);
