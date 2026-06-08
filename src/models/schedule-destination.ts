import { model, ObjectId, Schema } from "mongoose";
import { stationModel } from "./station";
import { companyModel } from "./company";
export interface ISchedule {
  from: string;
  to: string;
  departure_time: string;
  arrival_time: string;
  departure_station: string | ObjectId;
  arrival_station: string | ObjectId;
  company: string | ObjectId;
}
const schema = new Schema<ISchedule>({
  from: { type: Schema.Types.String, required: true },
  to: { type: Schema.Types.String, required: true },
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
});
export const scheduleModel = model("schedule_destinations", schema);
