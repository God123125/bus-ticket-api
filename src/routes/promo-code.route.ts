import { IRoute } from "../interfaces/route";
import { RoleEnum } from "../interfaces/role-enum";
import { Response, Request } from "express";
import { responseServerError } from "../utils/log.util";
import { promoCodeModel } from "../models/promo-code";
import { parseToExpressRoute } from "../utils/route.util";
import PromoCodeController from "../controllers/promo-code.controller";
import { IPaginationForm } from "../interfaces/pagination";
const routes: IRoute[] = [
  {
    path: "/",
    method: "get",
    authentication: true,
    handler: async (req: Request, res: Response) => {
      try {
        const pagination: IPaginationForm = {
          page: req.query.page ? Number(req.query.page) : 1,
          limit: req.query.limit ? Number(req.query.limit) : 10,
        };
        const data = await PromoCodeController.getInstance().getMany({
          pagination,
          query: {},
        });
        const count = await PromoCodeController.getInstance().count();
        res.json({ list: data, total: count });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/available",
    method: "get",
    authentication: true,
    handler: async (req: Request, res: Response) => {
      try {
        const data =
          await PromoCodeController.getInstance().getAvailablePromoCode(
            req.user as string,
          );
        res.json({ list: data });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/",
    method: "post",
    authentication: true,
    handler: async (req: Request, res: Response) => {
      try {
        const body = req.body;
        const data = await PromoCodeController.getInstance().create(body);
        return res.status(200).json({
          msg: "Promo code created successfully!",
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
    authentication: true,
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const body = req.body;
        const data = await PromoCodeController.getInstance().update(
          { _id: id },
          body,
        );
        return res.status(200).json({
          msg: "Promo code updated successfully!",
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
    authentication: true,
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const data = await PromoCodeController.getInstance().delete({
          _id: id,
        });
        return res.status(200).json({
          msg: "Promo code deleted successfully!",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const promoRoute = parseToExpressRoute(routes);
