import { merchantReportController } from "../controllers/merchant-report.controller";
import { RoleEnum } from "../interfaces/role-enum";
import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";

const routes: IRoute[] = [
  {
    path: "/",
    method: "get",
    roles: [RoleEnum.Merchant],
    handler: merchantReportController.booking_report,
  },
];
export const merchantReportRoute = parseToExpressRoute(routes);
