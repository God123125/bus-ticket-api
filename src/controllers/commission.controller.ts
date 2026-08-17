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

  getCommissionByCompany() {
    return this.aggregate([
      {
        $group: {
          _id: "$company",
          total_commission: {
            $sum: "$total_commission",
          },
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "_id",
          foreignField: "_id",
          as: "company",
        },
      },
      {
        $unwind: "$company",
      },
      {
        $project: {
          _id: 0,
          company: "$company",
          total_commission: 1,
        },
      },
    ]);
  }
}
