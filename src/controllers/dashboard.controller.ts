import { Request, Response } from "express";
import { tripModel } from "../models/trip";
import { busModel } from "../models/bus";
import { responseServerError } from "../utils/log.util";
import mongoose from "mongoose";
import { bookingModel } from "../models/booking";
import BookingController from "./booking.controller";
import { IPaginationForm } from "../interfaces/pagination";

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
  trends_analytical_chart: async (req: Request, res: Response) => {
    try {
      const company = (req as any).company;
      // 1. Set date range for the past 7 days (including today)
      const days = parseInt(req.query.days as string) || 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);
      // 2. Build match filter (Confirmed bookings only + company scope)
      const matchFilter: any = {
        createdAt: { $gte: startDate },
        status: "CONFIRMED", // Only count confirmed revenue/bookings
      };
      if (company) {
        matchFilter.company = new mongoose.Types.ObjectId(company);
      }
      // 3. Aggregate data grouped by Day (YYYY-MM-DD)
      const aggregatedData = await bookingModel.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "+07:00", // Adjust to Cambodia/Indochina timezone (UTC+7)
              },
            },
            total_revenue: { $sum: "$total_price" },
            total_bookings: { $sum: 1 },
            total_seats_sold: {
              $sum: { $size: { $ifNull: ["$booked_seats", []] } },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      // 4. Fill in missing days with 0 (so chart has continuous X-axis labels)
      const dataMap = new Map(aggregatedData.map((item) => [item._id, item]));
      const chartData = [];
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
        const dayLabel = dayNames[currentDate.getDay()]; // e.g. 'Fri'
        const existing = dataMap.get(dateStr);
        chartData.push({
          date: dateStr,
          day: dayLabel, // e.g. "Mon", "Fri"
          label: `${dayLabel} (${dateStr?.slice(5)})`, // e.g. "Fri (08-28)"
          total_revenue: existing ? existing.total_revenue : 0,
          total_bookings: existing ? existing.total_bookings : 0,
          total_seats_sold: existing ? existing.total_seats_sold : 0,
        });
      }
      res.json({
        success: true,
        data: chartData,
      });
    } catch (error: any) {
      responseServerError(res, error);
    }
  },
  top_performance_destination: async (req: Request, res: Response) => {
    try {
      const matchFilter: any = {
        status: "CONFIRMED",
        company: req.company,
      };
      const data = await bookingModel.aggregate([
        {
          $match: matchFilter,
        },
        {
          $lookup: {
            from: "trips",
            localField: "trip",
            foreignField: "_id",
            as: "trip_data",
            pipeline: [
              {
                $lookup: {
                  from: "schedules",
                  localField: "schedule",
                  foreignField: "_id",
                  as: "schedule_data",
                  pipeline: [
                    {
                      $lookup: {
                        from: "geographics",
                        localField: "from",
                        foreignField: "_id",
                        as: "from",
                      },
                    },
                    {
                      $lookup: {
                        from: "geographics",
                        localField: "to",
                        foreignField: "_id",
                        as: "to",
                      },
                    },
                    {
                      $unwind: {
                        path: "$from",
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                    {
                      $unwind: {
                        path: "$to",
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                  ],
                },
              },
              {
                $unwind: {
                  path: "$schedule_data",
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$trip_data",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$trip_data.schedule",
            totalBookings: { $sum: 1 },
            tripInfo: { $first: "$trip_data.schedule_data" },
          },
        },
      ]);
      res.json(data);
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  booking_status_distribution: async (req: Request, res: Response) => {
    try {
      const company = req.company;
      const data = await bookingModel.aggregate([
        {
          $match: {
            company: company,
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);
      res.json(data);
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  five_recent_booking: async (req: Request, res: Response) => {
    try {
      const company = req.company;
      const pagination: IPaginationForm = {
        page: 1,
        limit: 5,
      };
      const data = await BookingController.getInstance().getMany({
        query: {
          company: company,
          status: "CONFIRMED",
        },
        pagination,
      });
      res.json(data);
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
};
