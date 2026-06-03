import { model, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";
export interface ISeat extends IMongoObject {
  seat_no: string;
  description: string;
}
const schema = new Schema<ISeat>({
  seat_no: { type: Schema.Types.String, required: true },
  description: { type: Schema.Types.String, required: false },
});
export const seatModel = model("seats", schema);
