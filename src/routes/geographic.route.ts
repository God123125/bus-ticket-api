import { Request, Response } from "express";
import { RoleEnum } from "../interfaces/role-enum";
import { IRoute } from "../interfaces/route";
import { responseServerError } from "../utils/log.util";
import { IGeographic } from "../models/geographic";
import GeographicController from "../controllers/geographic.controller";
import { IPaginationForm } from "../interfaces/pagination";

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
  {
    path: "/",
    method: "get",
    roles: [RoleEnum.Admin, RoleEnum.Merchant],
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
        const data = await GeographicController.getInstance().getMany({
          query,
          pagination,
          sort: { createdAt: -1 },
        });
        const total = await GeographicController.getInstance().count(query);
        res.json({ list: data, total: total });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "patch",
    roles: [RoleEnum.Admin, RoleEnum.Merchant],
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const exists = await GeographicController.getInstance().getById(id);
        if (!exists) {
          return res.status(404).json({
            msg: "Geographic not found",
          });
        }
        const body: Partial<IGeographic> = req.body;
        const data = await GeographicController.getInstance().update(
          { _id: id },
          body,
        );
        res.json({
          msg: "Geographic updated successfully",
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
    roles: [RoleEnum.Admin, RoleEnum.Merchant],
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const data = await GeographicController.getInstance().delete({
          _id: id,
        });
        res.json({
          msg: "Geographic deleted successfully",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const geographicRoute = routes;
