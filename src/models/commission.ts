import { IMongoObject } from "../interfaces/mongo-object";
import { model, ObjectId, Schema } from "mongoose";

export interface ICommission extends IMongoObject {
  company: string | ObjectId;
  trip: string | ObjectId;
  total_commission: number;
  status: string;
}
const schema: Schema<ICommission> = new Schema<ICommission>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "companies",
      required: true,
    },
    trip: {
      type: Schema.Types.ObjectId,
      ref: "trips",
      required: true,
    },
    total_commission: { type: Schema.Types.Number, required: true },
    status: { type: Schema.Types.String, required: false, default: "pending" },
  },
  { timestamps: true },
);
export const commissionModel = model("commissions", schema);
