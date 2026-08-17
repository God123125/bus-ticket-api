import { commissionModel, ICommission } from "../models/commission";
import { Controller } from "./controller";

export default class CommissionController extends Controller<ICommission> {
  private static instance: CommissionController;
  private constructor() {
    super(commissionModel);
  }
  public static getInstance(): CommissionController {
    if (!CommissionController.instance) {
      CommissionController.instance = new CommissionController();
    }
    return CommissionController.instance;
  }
}
