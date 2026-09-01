import { ObjectId, Types } from "mongoose";
import { ITrip, tripModel } from "../models/trip";
import { Controller } from "./controller";
import { scheduleModel } from "../models/schedule-destination";

export default class TripController extends Controller<ITrip> {
  private static instance: TripController;
  private constructor() {
    super(tripModel);
  }
  public static getInstance(): TripController {
    if (!TripController.instance) {
      TripController.instance = new TripController();
    }
    return TripController.instance;
  }
  public async getByTripId(tripId: string | ObjectId) {
    const objectId =
      typeof tripId === "string" ? new Types.ObjectId(tripId) : tripId;
    const trip = await this.model.aggregate([
      {
        $match: {
          _id: objectId,
        },
      },
      {
        $lookup: {
          from: "buses",
          localField: "bus",
          foreignField: "_id",
          as: "bus",
          pipeline: [{ $project: { "images.publicId": 0 } }],
        },
      },
      { $unwind: { path: "$bus", preserveNullAndEmptyArrays: true } },

      // populate company, selecting only name and image
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "company",
          pipeline: [{ $project: { name: 1, image: 1 } }],
        },
      },
      { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },

      // populate schedule, with nested populate of from/to
      {
        $lookup: {
          from: "schedule_destinations",
          localField: "schedule",
          foreignField: "_id",
          as: "schedule",
          pipeline: [
            {
              $lookup: {
                from: "geographics", // adjust to your actual "from" ref collection name
                localField: "from",
                foreignField: "_id",
                as: "from",
              },
            },
            { $unwind: { path: "$from", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "geographics", // adjust to your actual "to" ref collection name
                localField: "to",
                foreignField: "_id",
                as: "to",
              },
            },
            { $unwind: { path: "$to", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                imagePublicId: 0,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$schedule", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "seat_holds",
          let: { tripId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$trip", "$$tripId"] },
              },
            },
            {
              $project: {
                _id: 0,
                booked_seats: 1,
              },
            },
          ],
          as: "seat_holds",
        },
      },
      {
        $addFields: {
          seat_holds: {
            $reduce: {
              input: "$seat_holds",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this.booked_seats"] },
            },
          },
        },
      },
    ]);
    return trip[0];
  }

  public async getMostFourPopularSchedule() {
    const topBooked = await this.model.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "trip",
          as: "booking_data",
        },
      },
      { $unwind: "$booking_data" }, // NO preserveNullAndEmptyArrays here — only real bookings count
      {
        $lookup: {
          from: "schedule_destinations",
          localField: "schedule",
          foreignField: "_id",
          as: "schedule",
        },
      },
      { $unwind: "$schedule" },
      {
        $lookup: {
          from: "geographics",
          localField: "schedule.from",
          foreignField: "_id",
          as: "from",
        },
      },
      { $unwind: "$from" },
      {
        $lookup: {
          from: "geographics",
          localField: "schedule.to",
          foreignField: "_id",
          as: "to",
        },
      },
      { $unwind: "$to" },
      {
        $group: {
          _id: "$schedule._id",
          from: { $first: "$from.name" },
          to: { $first: "$to.name" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 4 },
    ]);

    if (topBooked.length > 0) {
      return topBooked;
    }
    const randomSchedule = await scheduleModel.aggregate([
      {
        $lookup: {
          from: "geographics",
          localField: "from",
          foreignField: "_id",
          as: "from",
        },
      },
      { $unwind: "$from" },
      {
        $lookup: {
          from: "geographics",
          localField: "to",
          foreignField: "_id",
          as: "to",
        },
      },
      { $unwind: "$to" },
      {
        $project: {
          from: "$from.name",
          to: "$to.name",
        },
      },
      { $limit: 4 },
    ]);
    return randomSchedule;
  }
}
