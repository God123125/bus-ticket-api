import { model, ObjectId, Schema } from "mongoose";
import { IMongoObject } from "../interfaces/mongo-object";

export interface IFeedback extends IMongoObject {
  company: ObjectId;
  message: string;
  star: number;
  image: string;
  imagePublicId: string;
}
const schema: Schema<IFeedback> = new Schema<IFeedback>(
  {
    company: { type: Schema.Types.ObjectId, ref: "companies", required: true },
    message: { type: Schema.Types.String, required: true },
    star: { type: Schema.Types.Number, required: true },
    image: { type: Schema.Types.String, required: false },
    imagePublicId: { type: Schema.Types.String, required: false },
  },
  { timestamps: true },
);
export const feedbackModel = model("feedbacks", schema);
