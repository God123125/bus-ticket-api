import { model, Schema, Types } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";
export interface IUser extends IMongoObject {
  username: string;
  password: string;
  addresss: string;
  tel: string;
  profile: string;
  profilePublicId: string;
  role: string;
}
const schema = new Schema<IUser>(
  {
    username: { type: Schema.Types.String, required: true },
    password: { type: Schema.Types.String, required: true },
    addresss: { type: Schema.Types.String, required: false },
    tel: { type: Schema.Types.String, required: false },
    profile: { type: Schema.Types.String, required: false },
    profilePublicId: { type: Schema.Types.String, required: false },
    role: { type: Schema.Types.String, required: true },
  },
  { timestamps: true },
);
export const userModel = model("users", schema);
