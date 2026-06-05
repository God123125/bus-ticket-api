import { model, ObjectId, Schema } from "mongoose";
import { userModel } from "./users";
export interface IStation {
  station_name: string;
  latitude: number;
  longitude: number;
  company: string | ObjectId;
}
const schema = new Schema<IStation>(
  {
    station_name: { type: Schema.Types.String, required: true },
    latitude: { type: Schema.Types.Number, required: true },
    longitude: { type: Schema.Types.Number, required: true },
    company: {
      type: Schema.Types.ObjectId,
      ref: userModel.collection.collectionName,
      required: true,
    },
  },
  { timestamps: true },
);
export const stationModel = model("stations", schema);
