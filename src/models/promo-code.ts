import { model, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";

export interface IPromoCode extends IMongoObject {
  code: string;
  discountType: string;
  value: number;
  is_active: boolean;
  expiresAt: Date;
  maxUses: number;
}
const schema = new Schema<IPromoCode>(
  {
    code: { type: String, required: true },
    discountType: { type: String, required: true },
    value: { type: Number, required: true },
    is_active: { type: Boolean, required: true, default: true },
    expiresAt: { type: Date, required: true },
    maxUses: { type: Number, required: true },
  },
  { timestamps: true },
);

export const promoCodeModel = model<IPromoCode>("promo_codes", schema);
