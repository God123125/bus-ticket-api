import { Request, Response } from "express";
import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import { responseServerError } from "../utils/log.util";
import BusController from "../controllers/buses.controller";
import { IBus } from "../models/bus";
const routes: IRoute[] = [
  {
    path: "/",
    method: "get",
    handler: async (req: Request, res: Response) => {
      try {
        const buses = await BusController.getInstance().getMany({
          query: { company: req.company },
        });
        const total = await BusController.getInstance().count();
        res.json({
          list: buses,
          total,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/",
    method: "post",
    handler: async (req: Request, res: Response) => {
      try {
        const body: IBus = { ...req.body, company: req.company };
        const data = await BusController.getInstance().create(body);
        res.json({
          msg: "Bus created successfully!",
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
        const bus = await BusController.getInstance().getById(id);
        if (!bus) return res.status(404).json({ msg: "Bus not found!" });
        const body: Partial<IBus> = req.body;
        const data = await BusController.getInstance().update(
          { _id: id },
          body,
        );
        res.json({
          msg: "Bus updated successfully!",
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
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];

export const busRoute = parseToExpressRoute(routes);
