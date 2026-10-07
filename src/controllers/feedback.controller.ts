import { IFeedback, feedbackModel } from "../models/feedback";
import { Controller } from "./controller";
import { ObjectId, Types } from "mongoose";

export default class FeedbackController extends Controller<IFeedback> {
  private static instance: FeedbackController;
  private constructor() {
    super(feedbackModel);
  }
  public static getInstance(): FeedbackController {
    if (!FeedbackController.instance) {
      FeedbackController.instance = new FeedbackController();
    }
    return FeedbackController.instance;
  }
  public async getFeedbackSummaryCard(companyId: string) {
    let goodFeedack = 0;
    let badFeedback = 0;
    const query: any = {};
    if (companyId) {
      query.company = new Types.ObjectId(companyId);
    }
    const data = await this.getMany({
      query: query,
    });
    const totalFeedback = data.length;
    data.forEach((item) => {
      if (item.star >= 4) {
        goodFeedack++;
      } else {
        badFeedback++;
      }
    });
    return {
      good: goodFeedack,
      bad: badFeedback,
      total_feedback: totalFeedback,
    };
  }
}
