import { model, ObjectId, Schema, Types } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";

export interface IPromoRedemption extends IMongoObject {
  promo_code: Types.ObjectId;
  user: Types.ObjectId;
  booking: Types.ObjectId;
  useCount: number;
}
const schema = new Schema<IPromoRedemption>(
  {
    promo_code: {
      type: Schema.Types.ObjectId,
      ref: "promo_codes",
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
    booking: { type: Schema.Types.ObjectId, ref: "bookings", required: true },
    useCount: { type: Number, required: true, default: 1 },
  },
  { timestamps: true },
);
export const promoRedemptionModel = model<IPromoRedemption>(
  "promo_redemptions",
  schema,
);
