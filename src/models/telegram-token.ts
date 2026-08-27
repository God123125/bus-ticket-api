import { model, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";

export interface ITelegramToken extends IMongoObject {
  userId: string;
  token: string;
  used: boolean;
  createdAt: Date;
}
const schema = new Schema<ITelegramToken>(
  {
    userId: { type: Schema.Types.String, required: true, ref: "users" },
    token: { type: Schema.Types.String, required: true },
    used: { type: Schema.Types.Boolean, default: false },
    createdAt: { type: Schema.Types.Date, default: Date.now, expires: "5m" },
  },
  { timestamps: true },
);
export const telegramTokenModel = model<ITelegramToken>(
  "telegram_users",
  schema,
);
