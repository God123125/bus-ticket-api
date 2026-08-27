import { Request, Response } from "express";
import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import { responseServerError } from "../utils/log.util";
import { ISeatHold } from "../models/seat-hold";
import TripController from "../controllers/trip.controller";
import SeatHoldController from "../controllers/seat-hold.controller";
import { IPaginationForm } from "../interfaces/pagination";

const routes: IRoute[] = [
  {
    path: "/",
    method: "post",
    authentication: false,
    handler: async (req: Request, res: Response) => {
      try {
        const body: ISeatHold = req.body;
        if (req.user) {
          body.user = req.user;
        }
        const tripDoc = await TripController.getInstance().getById(body.trip);
        if (!tripDoc) {
          return res.status(404).json({ msg: "Trip not found" });
        }
        body.company = tripDoc.company;
        const data = await SeatHoldController.getInstance().create(body);
        return res.status(200).json({
          msg: "Hold seat successfully!",
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
    authentication: false,
    handler: async (req: Request, res: Response) => {
      try {
        const pagination: IPaginationForm = {
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 10,
        };
        const search = req.query.search;
        let query: any = {};
        if (search) {
          query.$or = [
            { name_kh: { $regex: search, $options: "i" } },
            { name_en: { $regex: search, $options: "i" } },
          ];
        }
        if (req.company) {
          query.company = req.company;
        }
        const data = await SeatHoldController.getInstance().getMany({
          query,
          pagination,
          sort: { createdAt: -1 },
        });
        const total = await SeatHoldController.getInstance().count(query);
        res.json({ list: data, total: total });
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
        const body: Partial<ISeatHold> = req.body;
        const data = await SeatHoldController.getInstance().update(
          { _id: id },
          body,
        );
        return res.status(200).json({
          msg: "Hold seat updated successfully!",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const seatHoldRoute = parseToExpressRoute(routes);
