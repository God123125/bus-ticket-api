import { model, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";
export interface IClientUser extends IMongoObject {
  email: string;
  name: string;
  google_id: string;
  profile: string;
  profilePublicId: string;
}
const schema = new Schema<IClientUser>(
  {
    email: { type: Schema.Types.String, required: true },
    name: { type: Schema.Types.String, required: false },
    google_id: { type: Schema.Types.String, required: true },
    profile: { type: Schema.Types.String, required: false },
    profilePublicId: { type: Schema.Types.String, required: false },
  },
  { timestamps: true },
);
export const clientUserModel = model("client_users", schema);
