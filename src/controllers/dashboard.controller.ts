import { Request, Response } from "express";
import { tripModel } from "../models/trip";
import { busModel } from "../models/bus";
import { responseServerError } from "../utils/log.util";
import mongoose from "mongoose";
import { bookingModel } from "../models/booking";
import BookingController from "./booking.controller";
import { IPaginationForm } from "../interfaces/pagination";
import { stationModel } from "../models/station";
import { userModel } from "../models/users";
import { RoleEnum } from "../interfaces/role-enum";
import { companyModel } from "../models/company";
import { clientUserModel } from "../models/client-user";
import { commissionModel } from "../models/commission";

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
        {
          $project: {
            _id: 0,
            booking_status: "$_id",
            count: 1,
          },
        },
      ]);
      res.json(data);
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  five_recent_bookings: async (req: Request, res: Response) => {
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
        sort: {
          createdAt: -1,
        },
      });
      res.json(data);
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  count_property_for_each_company: async (req: Request, res: Response) => {
    try {
      const busCount = await busModel.countDocuments({ company: req.company });
      const stationCount = await stationModel.countDocuments({
        company: req.company,
      });
      const tripCount = await tripModel.countDocuments({
        company: req.company,
        status: "ACTIVE",
      });
      res.json({
        busCount,
        stationCount,
        tripCount,
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  // admin dashboard
  count_user_and_company: async (req: Request, res: Response) => {
    try {
      const userCount = await userModel.countDocuments();
      const companyCount = await companyModel.countDocuments();
      const clientUser = await clientUserModel.countDocuments();
      res.json({
        userCount,
        companyCount,
        clientUser,
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  company_comparison_doughnut_chart: async (req: Request, res: Response) => {
    try {
      const activeCompany = await companyModel.countDocuments({
        is_active: true,
      });
      const inactiveCompany = await companyModel.countDocuments({
        is_active: false,
      });
      res.json({
        activeCompany,
        inactiveCompany,
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  top_booking_company_bar_chart: async (req: Request, res: Response) => {
    try {
      const data = await bookingModel.aggregate([
        {
          $match: {
            status: "CONFIRMED",
          },
        },
        {
          $group: {
            _id: "$company",
            count: { $sum: 1 },
            total_revenue: { $sum: "$total_price" },
          },
        },
        {
          $lookup: {
            from: "companies",
            localField: "company",
            foreignField: "_id",
            as: "company_data",
          },
        },
        {
          $unwind: "$company_data",
        },
        {
          $project: {
            _id: 0,
            company: "$company_data",
            count: 1,
            total_revenue: 1,
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]);
      res.json(data);
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  yearly_commission_income: async (req: Request, res: Response) => {
    try {
      const year =
        parseInt(req.query.year as string) || new Date().getFullYear();

      // Start: Jan 1 00:00:00, End: Dec 31 23:59:59 of the target year
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);

      // Aggregate commission paid by merchants for the selected year
      const aggregatedData = await commissionModel.aggregate([
        {
          $match: {
            status: "paid",
            updatedAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: { $month: { date: "$updatedAt", timezone: "+07:00" } }, // Returns 1 to 12
            total_income: { $sum: "$total_commission" },
            total_settlements: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Create a lookup map by month number (1 - 12)
      const dataMap = new Map(
        aggregatedData.map((item) => [item._id, item.total_income]),
      );

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Format for continuous 12-month Line Chart
      const monthlyData = months.map((monthName, index) => {
        const monthNumber = index + 1; // 1 to 12
        return {
          month: monthName,
          monthNumber: monthNumber,
          label: `${monthName} ${year}`,
          income: dataMap.get(monthNumber) || 0,
        };
      });

      res.json({
        success: true,
        year: year,
        // Array of 12 data points
        data: monthlyData,
        // Direct arrays if your frontend library (like Chart.js / ApexCharts) prefers separate series/categories
        chart: {
          categories: months,
          series: monthlyData.map((item) => item.income),
        },
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
};
