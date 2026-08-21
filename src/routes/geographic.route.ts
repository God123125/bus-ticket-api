import { Request, Response } from "express";
import { RoleEnum } from "../interfaces/role-enum";
import { IRoute } from "../interfaces/route";
import { responseServerError } from "../utils/log.util";
import { IGeographic } from "../models/geographic";
import GeographicController from "../controllers/geographic.controller";

const routes: IRoute[] = [
  {
    path: "/",
    method: "post",
    roles: [RoleEnum.Admin, RoleEnum.Merchant],
    handler: async (req: Request, res: Response) => {
      try {
        const body: IGeographic = req.body;
        const data = await GeographicController.getInstance().create(body);
        res.json({
          msg: "Geographic created successfully",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const geographicRoute = routes;
