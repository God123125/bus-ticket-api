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

  async getCommissionByCompany(
    date: Date,
    page: number = 1,
    limit: number = 10,
  ) {
    // Shift to Phnom Penh time to read the correct year/month
    const local = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const year = local.getUTCFullYear();
    const month = local.getUTCMonth(); // 0-based

    // 00:00 local time = 17:00 UTC of the previous day, hence the -7
    const start = new Date(Date.UTC(year, month, 1, -7));
    const end = new Date(Date.UTC(year, month + 1, 1, -7));
    const skip = (page - 1) * limit;
    const storeAggregateData: any = await this.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: "$company",
          total_commission: { $sum: "$total_commission" },
          status: { $first: "$status" },
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
            {
              $project: {
                name: 1,
                image: 1,
                owner: {
                  profile: "$owner.profile",
                  full_name: "$owner.full_name",
                  username: "$owner.username",
                  tel: "$owner.tel",
                },
              },
            },
          ],
        },
      },
      { $unwind: "$company" },
      {
        $project: {
          _id: 0,
          company_name: "$company.name",
          company_image: "$company.image",
          company_owner: "$company.owner",
          status: 1,
          total_commission: 1,
        },
      },
      { $sort: { company_name: 1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          meta: [{ $count: "total" }],
        },
      },
    ]);
    const data = storeAggregateData[0]?.data || [];
    const total = storeAggregateData[0]?.meta[0]?.total || 0;
    return { list: data, total };
  }

  getMonthRange(date: Date) {
    const PP_OFFSET = 7 * 60 * 60 * 1000;
    const local = new Date(date.getTime() + PP_OFFSET);
    const year = local.getUTCFullYear();
    const month = local.getUTCMonth();
    return {
      start: new Date(Date.UTC(year, month, 1, -7)),
      end: new Date(Date.UTC(year, month + 1, 1, -7)),
    };
  }
  async markMonthAsPaid(companyId: string, date: Date) {
    const { start, end } = this.getMonthRange(date);
    const result = await this.updateMany(
      {
        company: companyId,
        createdAt: { $gte: start, $lt: end },
        status: { $ne: "PAID" }, // skip already paid
      },
      {
        $set: {
          status: "PAID",
          paid_at: new Date(),
        },
      },
    );

    return { matched: result.matchedCount, updated: result.modifiedCount };
  }
}
