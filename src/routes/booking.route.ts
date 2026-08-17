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
  {
    path: "/:id",
    method: "patch",
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const booking = await BookingController.getInstance().getById(id);
        if (!booking)
          return res.status(404).json({ msg: "Booking not found!" });
        const body: Partial<IBooking> = {
          ...req.body,
          user: req.user,
        };
        const data = await BookingController.getInstance().update(
          { _id: id },
          body,
        );
        return res.status(200).json({
          msg: "Booking updated successfully!",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "delete",
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const booking = await BookingController.getInstance().getById(id);
        if (!booking)
          return res.status(404).json({ msg: "Booking not found!" });
        const data = await BookingController.getInstance().delete({ _id: id });
        return res.status(200).json({
          msg: "Booking deleted successfully!",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "get",
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const booking = await BookingController.getInstance()
          .getById(id)
          .populate([{ path: "user" }, { path: "trip" }]);
        if (!booking)
          return res.status(404).json({ msg: "Booking not found!" });
        return res.status(200).json({
          msg: "Booking fetched successfully!",
          data: booking,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const bookingRoute = parseToExpressRoute(routes);
