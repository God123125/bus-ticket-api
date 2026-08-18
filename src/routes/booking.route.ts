import BookingController from "../controllers/booking.controller";
import CommissionController from "../controllers/commission.controller";
import CompanyController from "../controllers/company.controller";
import TripController from "../controllers/trip.controller";
import { IRoute } from "../interfaces/route";
import { IBooking } from "../models/booking";
import { ICompany } from "../models/company";
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

        if (!body.company && body.trip) {
          const tripDoc = await TripController.getInstance().getById(body.trip);
          if (tripDoc) {
            body.company = tripDoc.company;
          }
        }

        const data = await BookingController.getInstance().create(body);

        if (body.trip && body.booked_seats && body.booked_seats.length > 0) {
          await TripController.getInstance().update({ _id: body.trip }, {
            $addToSet: { booked_seats: { $each: body.booked_seats } },
          } as any);
        }

        const items = Array.isArray(data) ? data : [data];
        const commissions = await Promise.all(
          items.map(async (item) => {
            if (!item.company) return null;
            const company = (await CompanyController.getInstance().getById(
              item.company,
            )) as ICompany;
            return {
              company: item.company,
              trip: item.trip,
              total_commission:
                (item.total_price * (company?.commission_rate ?? 0)) / 100,
            };
          }),
        );
        const validCommissions = commissions.filter(Boolean);
        if (validCommissions.length > 0) {
          await CommissionController.getInstance().insertMany(
            validCommissions as any,
          );
        }

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
    authentication: false,
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const booking = await BookingController.getInstance().getById(id);
        if (!booking)
          return res.status(404).json({ msg: "Booking not found!" });
        const body: Partial<IBooking> = {
          ...req.body,
          ...(req.user ? { user: req.user } : {}),
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
    authentication: false,
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
    authentication: false,
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
