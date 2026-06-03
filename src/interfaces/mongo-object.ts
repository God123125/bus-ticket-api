import { ObjectId } from "mongoose";

export interface IMongoObject {
  _id?: string | ObjectId;
}
