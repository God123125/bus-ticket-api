import { model, ObjectId, Schema } from "mongoose";
import { stationModel } from "./station";
import { companyModel } from "./company";
import { IMongoObject } from "../interfaces/mongo-object";
export interface ISchedule extends IMongoObject {
  from: string | ObjectId;
  to: string | ObjectId;
  departure_time: string;
  arrival_time: string;
  departure_station: string | ObjectId;
  arrival_station: string | ObjectId;
  company: string | ObjectId;
  description: string;
  image: string;
  imagePublicId: string;
}
const schema = new Schema<ISchedule>({
  from: { type: Schema.Types.ObjectId, required: true, ref: "geographics" },
  to: { type: Schema.Types.ObjectId, required: true, ref: "geographics" },
  departure_time: { type: Schema.Types.String, required: true },
  arrival_time: { type: Schema.Types.String, required: true },
  departure_station: {
    type: Schema.Types.ObjectId,
    ref: stationModel.collection.collectionName,
    required: true,
  },
  arrival_station: {
    type: Schema.Types.ObjectId,
    ref: stationModel.collection.collectionName,
    required: true,
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: companyModel.collection.collectionName,
    required: true,
  },
  description: {
    type: Schema.Types.String,
    required: false,
  },
  image: { type: Schema.Types.String, required: false },
  imagePublicId: { type: Schema.Types.String, required: false },
});
export const scheduleModel = model("schedule_destinations", schema);
