import { model, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";

export interface IGeographic extends IMongoObject {
  name_en: string;
  name_kh: string;
}
const schema: Schema<IGeographic> = new Schema<IGeographic>({
  name_en: { type: String, required: false },
  name_kh: { type: String, required: true },
});

export const geographicModel = model<IGeographic>("geographics", schema);
