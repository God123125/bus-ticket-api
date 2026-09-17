import { Request, Response } from "express";
import { responseServerError } from "../utils/log.util";
import BookingController from "./booking.controller";
import mongoose from "mongoose";

export const merchantReportController = {
  booking_report: async (req: Request, res: Response) => {
    try {
      const companyId = req.company;
      const data = await BookingController.getInstance()
        .getMany({
          query: {
            company: companyId,
          },
          sort: {
            createdAt: -1,
          },
        })
        .populate([
          {
            path: "trip",
            select: "schedule",
            populate: [
              {
                path: "schedule",
                select: [
                  "from",
                  "to",
                  "image",
                  "arrival_time",
                  "departure_time",
                ],
                populate: [{ path: "from" }, { path: "to" }],
              },
            ],
          },
        ]);
      const pendingBookingCount = await BookingController.getInstance().count({
        company: companyId,
        status: "PENDING",
      });
      const confirmedBookingCount = await BookingController.getInstance().count(
        {
          company: companyId,
          status: "CONFIRMED",
        },
      );
      const cancelledBookingCount = await BookingController.getInstance().count(
        {
          company: companyId,
          status: "CANCELLED",
        },
      );
      const refundedBookingCount = await BookingController.getInstance().count({
        company: companyId,
        status: "REFUNDED",
      });
      const totalBookingCount = await BookingController.getInstance().count({
        company: companyId,
      });
      const totalBookingAmount =
        await BookingController.getInstance().aggregate([
          {
            $match: {
              company: new mongoose.Types.ObjectId(companyId),
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$total_price" },
            },
          },
        ]);
      res.json({
        list: data,
        pendingBookingCount,
        confirmedBookingCount,
        cancelledBookingCount,
        refundedBookingCount,
        totalBookingCount,
        totalBookingAmount: (totalBookingAmount[0] as any)?.totalAmount,
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
};
