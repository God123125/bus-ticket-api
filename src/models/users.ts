import { model, Schema, Types } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";
export interface IUser extends IMongoObject {
  full_name: string;
  username: string;
  password: string;
  address?: string;
  tel?: string;
  profile?: string;
  profilePublicId?: string;
  role: string;
  bank_acc_number: string;
  bank_acc_name: string;
}
const schema = new Schema<IUser>(
  {
    full_name: { type: Schema.Types.String, required: true },
    username: { type: Schema.Types.String, required: true },
    password: { type: Schema.Types.String, required: true },
    address: { type: Schema.Types.String, required: false },
    tel: { type: Schema.Types.String, required: false },
    profile: { type: Schema.Types.String, required: false },
    profilePublicId: { type: Schema.Types.String, required: false },
    role: { type: Schema.Types.String, required: true },
    bank_acc_number: { type: Schema.Types.String, required: false },
    bank_acc_name: { type: Schema.Types.String, required: false },
  },
  { timestamps: true },
);
export const userModel = model("users", schema);
