import { Request, response, Response } from "express";
import { RoleEnum } from "../interfaces/role-enum";
import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import { responseServerError } from "../utils/log.util";
import CommissionController from "../controllers/commission.controller";
import { commissionModel, ICommission } from "../models/commission";

const routes: IRoute[] = [
  {
    path: "/",
    method: "get",
    roles: [RoleEnum.Admin],
    handler: async (req: Request, res: Response) => {
      try {
        const date = req.query.date || new Date();
        const data =
          await CommissionController.getInstance().getCommissionByCompany(
            new Date(date as string),
          );
        return res.status(200).json({
          msg: "Commission fetched successfully!",
          list: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/status-count",
    method: "get",
    roles: [RoleEnum.Admin],
    handler: async (req: Request, res: Response) => {
      try {
        const company = (req.query.company as string) || req.company;
        const filter: any = {};
        if (company) {
          filter.company = company;
        }

        const [paidCompanies, pendingCompanies] = await Promise.all([
          commissionModel.distinct("company", { status: "PAID", ...filter }),
          commissionModel.distinct("company", { status: "PENDING", ...filter }),
        ]);

        const paid = paidCompanies.length;
        const pending = pendingCompanies.length;
        return res.status(200).json({
          msg: "Commission status fetched successfully!",
          data: {
            paid,
            pending,
          },
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/mark-paid",
    method: "post",
    roles: [RoleEnum.Admin],
    handler: async (req: Request, res: Response) => {
      try {
        const date = req.body.date || new Date();
        const data = await CommissionController.getInstance().markMonthAsPaid(
          req.company,
          date as Date,
        );
        return res.status(200).json({
          msg: "Commission marked as paid successfully!",
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
