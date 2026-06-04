import { model, ObjectId, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";
import { busModel } from "./bus";
export interface ITrip extends IMongoObject {
  bus: string | ObjectId;
}
const schema = new Schema<ITrip>(
  {
    bus: {
      type: Schema.Types.ObjectId,
      ref: busModel.collection.collectionName,
      required: true,
    },
  },
  { timestamps: true },
);
export const tripModel = model("trips", schema);
