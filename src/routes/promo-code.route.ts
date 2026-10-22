import { IRoute } from "../interfaces/route";
import { RoleEnum } from "../interfaces/role-enum";
import { Response, Request } from "express";
import { responseServerError } from "../utils/log.util";
import { promoCodeModel } from "../models/promo-code";
import { parseToExpressRoute } from "../utils/route.util";
import PromoCodeController from "../controllers/promo-code.controller";
const routes: IRoute[] = [
  {
    path: "/",
    method: "get",
    authentication: true,
    handler: async (req: Request, res: Response) => {
      try {
        const data =
          await PromoCodeController.getInstance().getAvailablePromoCode(
            req.user as string,
          );
        const count = data.length;
        res.json({ list: data, total: count });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const promoRoute = parseToExpressRoute(routes);
