import { IFeedback, feedbackModel } from "../models/feedback";
import { Controller } from "./controller";

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
}
