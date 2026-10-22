import { Types } from "mongoose";
import { IPromoCode, promoCodeModel } from "../models/promo-code";
import { Controller } from "./controller";

export default class PromoCodeController extends Controller<IPromoCode> {
  private static instance: PromoCodeController;
  private constructor() {
    super(promoCodeModel);
  }
  public static getInstance(): PromoCodeController {
    if (!PromoCodeController.instance) {
      PromoCodeController.instance = new PromoCodeController();
    }
    return PromoCodeController.instance;
  }
  public async getAvailablePromoCode(userId?: string) {
    const now = new Date();

    const pipeline: any[] = [
      { $match: { status: "Active", expiresAt: { $gt: now } } },
    ];

    if (userId) {
      pipeline.push(
        {
          $lookup: {
            from: "promo_redemptions",
            let: { promoId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$promo_code", "$$promoId"] },
                      { $eq: ["$user", new Types.ObjectId(userId)] },
                    ],
                  },
                },
              },
            ],
            as: "redemptions",
          },
        },
        {
          $addFields: {
            usedCount: {
              $ifNull: [{ $arrayElemAt: ["$redemptions.useCount", 0] }, 0],
            },
          },
        },
        { $match: { $expr: { $lt: ["$usedCount", "$maxUses"] } } },
        { $project: { redemptions: 0 } },
      );
    }

    return this.aggregate(pipeline);
  }
}
