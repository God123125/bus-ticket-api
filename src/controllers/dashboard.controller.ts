import { Request, Response } from "express";
import { tripModel } from "../models/trip";
import { busModel } from "../models/bus";
import { responseServerError } from "../utils/log.util";

export const merchantDashboardController = {
  get_merchant_dashboard: async (req: Request, res: Response) => {
    try {
      const company = req.company;
      const total_trips = await tripModel.countDocuments({ company: company });
      const total_buses = await busModel.countDocuments({ company: company });
      const bookingData = await tripModel.aggregate([
        {
          $lookup: {
            from: "bookings",
            let: { tripId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$trip", "$$tripId"] } } },
              { $sort: { createdAt: -1 } },
            ],
            as: "booking_data",
          },
        },
        {
          $addFields: {
            total_revenue: { $sum: "$booking_data.total_price" },
            total_bookings: { $size: "$booking_data" },
            recent_bookings: { $slice: ["$booking_data", 5] },
          },
        },
        {
          $project: {
            booking_data: 0,
          },
        },
      ]);
      res.json({
        ...bookingData,
        total_trips: total_trips,
        total_buses: total_buses,
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
};
