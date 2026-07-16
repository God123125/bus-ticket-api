import { Request, response, Response } from "express";
import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import { responseServerError } from "../utils/log.util";
import AdvertisingController from "../controllers/advertising.controller";
import { IPaginationForm } from "../interfaces/pagination";
import { IAdvertising } from "../models/advertising";

const routes: IRoute[] = [
  {
    path: "/",
    method: "get",
    handler: async (req: Request, res: Response) => {
      try {
        const pagination: IPaginationForm = req.query;
        const ads = await AdvertisingController.getInstance().getMany({
          pagination,
        });
        const total = AdvertisingController.getInstance().count();
        res.json({
          list: ads,
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
        const body: IAdvertising = req.body;
        const data = await AdvertisingController.getInstance().create(body);
        res.json({
          msg: "Advertising created successfully!",
          data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const advertisingRoute = parseToExpressRoute(routes);
