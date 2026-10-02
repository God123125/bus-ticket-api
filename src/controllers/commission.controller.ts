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
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
              },
            },
            { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
          ],
        },
      },
      {
        $unwind: "$company",
      },
      {
        $project: {
          _id: 0,
          company_name: "$company.name",
          company_image: "$company.image",
          company_owner: "$company.owner",
          total_commission: 1,
          status: "$status",
        },
      },
    ]);
  }
}
