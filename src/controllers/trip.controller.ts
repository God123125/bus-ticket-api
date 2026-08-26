import { ObjectId, Types } from "mongoose";
import { ITrip, tripModel } from "../models/trip";
import { Controller } from "./controller";

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
  public async getByScheduleId(tripId: string | ObjectId) {
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
        $unwind: {
          path: "$seat_holds",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          seat_holds: { $ifNull: ["$seat_holds.booked_seats", []] },
        },
      },
    ]);
    return trip[0];
  }
}
