import { Request, Response } from "express";
import { RoleEnum } from "../interfaces/role-enum";
import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import { responseServerError } from "../utils/log.util";
import CommissionController from "../controllers/commission.controller";
import { ICommission } from "../models/commission";

const routes: IRoute[] = [
  {
    path: "/",
    method: "get",
    roles: [RoleEnum.Admin],
    handler: async (req: Request, res: Response) => {
      try {
        const data =
          await CommissionController.getInstance().getCommissionByCompany();
        return res.status(200).json({
          msg: "Commission fetched successfully!",
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
    roles: [RoleEnum.Admin],
    handler: async (req: Request, res: Response) => {
      try {
        const company_id = req.params.id as string;
        const body: Partial<ICommission> = {
          ...req.body,
          user: req.user,
          status: "paid",
        };
        const data = await CommissionController.getInstance().updateMany(
          { company: company_id, status: "pending" },
          body,
        );
        return res.status(200).json({
          msg: "Commission updated successfully!",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const commissionRoute = parseToExpressRoute(routes);
