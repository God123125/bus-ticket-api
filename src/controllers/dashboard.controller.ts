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
import { scheduleModel } from "../models/schedule-destination";
import { getFullKhmerDateD, getShortKhmerDate } from "../utils/khmer.util";
import { start } from "node:repl";
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
      const dayNames = [
        "អាទិត្យ",
        "ចន្ទ",
        "អង្គារ",
        "ពុធ",
        "ព្រហស្បតិ៍",
        "សុក្រ",
        "សៅរ៍",
      ];
      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;
        // const dateStr = getShortKhmerDate(currentDate);
        const dayLabel = dayNames[currentDate.getDay()]; // e.g. 'Fri'
        const existing = dataMap.get(dateStr);
        chartData.push({
          date: dateStr,
          day: dayLabel, // e.g. "Mon", "Fri"
          label: `${dayLabel} (${day}-${month})`, // e.g. "Fri (08-28)"
          // label: dateStr,
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
        company: new mongoose.Types.ObjectId(req.company),
      };
      // 1. Run your existing aggregation (only returns schedules with bookings)
      const bookingCounts = await bookingModel
        .aggregate([
          { $match: matchFilter },
          {
            $lookup: {
              from: "trips",
              let: { tripId: "$trip" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$tripId"] } } },
                {
                  $lookup: {
                    from: "schedule_destinations",
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
              as: "trip_data",
            },
          },
          {
            $unwind: { path: "$trip_data", preserveNullAndEmptyArrays: false },
          },
          {
            $group: {
              _id: "$trip_data.schedule",
              totalBookings: { $sum: 1 },
              tripInfo: { $first: "$trip_data.schedule_data" },
            },
          },
          { $project: { "tripInfo.imagePublicId": 0 } },
        ])
        .allowDiskUse(true);

      // 2. Fetch ALL schedules (with the same from/to populate), independent of bookings
      const allSchedules = await scheduleModel
        .find({ company: req.company })
        .populate("from")
        .populate("to")
        .lean();

      // 3. Merge: every schedule appears, defaulting to 0 bookings
      const bookingMap = new Map(
        bookingCounts.map((b: any) => [String(b._id), b.totalBookings]),
      );

      const result = allSchedules
        .map((schedule: any) => ({
          schedule,
          totalBookings: bookingMap.get(String(schedule._id)) || 0,
        }))
        .sort((a: any, b: any) => b.totalBookings - a.totalBookings);
      res.json(result);
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  booking_status_distribution: async (req: Request, res: Response) => {
    try {
      const company = new mongoose.Types.ObjectId(req.company);
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
      const defaultStatuses = ["CONFIRMED", "PENDING", "CANCELLED"];

      const result = defaultStatuses.map((status) => {
        const found = data.find((d) => d.booking_status === status);
        return {
          booking_status: status,
          count: found ? found.count : 0,
        };
      });
      res.json(result);
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  five_recent_bookings: async (req: Request, res: Response) => {
    try {
      const company = req.company;
      // const pagination: IPaginationForm = {
      //   page: 1,
      //   limit: 5,
      // };
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const data = await BookingController.getInstance()
        .getMany({
          query: {
            company: company,
            status: { $in: ["CONFIRMED", "PENDING"] },
            createdAt: { $gte: startOfDay, $lte: endOfDay },
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
                select: "-imagePublicId",
                populate: [{ path: "from" }, { path: "to" }],
              },
            ],
          },
        ]);
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
      const data = await companyModel.aggregate([
        {
          $lookup: {
            from: "bookings",
            let: { companyId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$company", "$$companyId"] },
                  status: "CONFIRMED",
                },
              },
            ],
            as: "confirmed_bookings",
          },
        },
        {
          $addFields: {
            booking_count: { $size: "$confirmed_bookings" },
            total_revenue: { $sum: "$confirmed_bookings.total_price" },
          },
        },
        {
          $project: {
            _id: 0,
            name: 1,
            booking_count: 1,
            total_revenue: 1,
          },
        },
        {
          $sort: { booking_count: -1 },
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
