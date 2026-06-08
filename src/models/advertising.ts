import { model, ObjectId, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";
export interface IAdvertising extends IMongoObject {
  description: string;
  image: string;
  imagePublicId: string;
  company: string | ObjectId;
}
const schema = new Schema<IAdvertising>({
  description: { type: Schema.Types.String, required: false },
  image: { type: Schema.Types.String, required: true },
  imagePublicId: { type: Schema.Types.String, required: true },
  company: { type: Schema.Types.String, required: true },
});
export const advertisingModel = model("advertisings", schema);
