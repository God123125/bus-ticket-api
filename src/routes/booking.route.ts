import BookingController from "../controllers/booking.controller";
import { IRoute } from "../interfaces/route";
import { IBooking } from "../models/booking";
import { responseServerError } from "../utils/log.util";
import { parseToExpressRoute } from "../utils/route.util";
import { Request, Response } from "express";

const routes: IRoute[] = [
  {
    path: "/",
    method: "post",
    authentication: false,
    handler: async (req: Request, res: Response) => {
      try {
        const body: IBooking = {
          user: req.user,
          ...req.body,
        };
        const data = await BookingController.getInstance().create(body);
        return res.status(200).json({
          msg: "Booking created successfully!",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/",
    method: "get",
    handler: async (req: Request, res: Response) => {
      try {
        const data = await BookingController.getInstance()
          .getMany({
            query: {
              user: req.user,
            },
          })
          .populate([{ path: "user" }, { path: "trip" }]);
        return res.status(200).json({
          msg: "Booking fetched successfully!",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const bookingRoute = parseToExpressRoute(routes);
