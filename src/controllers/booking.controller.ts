import { Request, Response } from "express";
import { responseServerError } from "../utils/log.util";
import { bookingModel, IBooking } from "../models/booking";
export const bookingController = {
  create: async (req: Request, res: Response) => {
    try {
      const bookedBy = req.user;
      const body: IBooking = {
        user: bookedBy,
        total_price: req.body.total_price,
        booked_seats: req.body.booked_seats,
        trip: req.body.trip,
      };
      const data = await bookingModel.create(body);
      res.json({
        msg: "Trip booked successfully!",
        data: data,
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
};
