import { Request, Response } from "express";
import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import { responseServerError } from "../utils/log.util";
import StationController from "../controllers/station.controller";
import { RoleEnum } from "../interfaces/role-enum";
import { IPaginationForm } from "../interfaces/pagination";
import { IStation } from "../models/station";

const routes: IRoute[] = [
  {
    path: "/",
    method: "post",
    roles: [RoleEnum.Merchant, RoleEnum.Staff],
    handler: async (req: Request, res: Response) => {
      try {
        const body = { ...req.body, company: req.company };
        const data = await StationController.getInstance().create(body);
        res.json({
          msg: "Station created successfully",
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
    roles: [RoleEnum.Merchant, RoleEnum.Staff],
    handler: async (req: Request, res: Response) => {
      try {
        const pagination: IPaginationForm = {
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 10,
        };
        const search = req.query.search;
        let query: any = { company: req.company };
        if (search) {
          query.station_name = { $regex: search, $options: "i" };
        }
        const list = await StationController.getInstance()
          .getMany({ query, pagination, sort: { createdAt: -1 } })
          .select("-company");
        const total = await StationController.getInstance().count(query);
        res.json({ list: list, total: total });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "get",
    roles: [RoleEnum.Merchant, RoleEnum.Staff],
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const data = await StationController.getInstance().getById(id);
        res.json(data);
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "patch",
    roles: [RoleEnum.Merchant, RoleEnum.Staff],
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const body: Partial<IStation> = req.body;
        const data = await StationController.getInstance().update(
          { _id: id },
          body,
        );
        res.json({
          msg: "Station updated successfully",
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
    roles: [RoleEnum.Merchant, RoleEnum.Staff],
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        await StationController.getInstance().delete({ _id: id });
        res.json({
          msg: "Station deleted successfully",
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const stationRoute = parseToExpressRoute(routes);
