// src/routes/dashboard.route.ts
import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import { RoleEnum } from "../interfaces/role-enum";
import { merchantDashboardController } from "../controllers/dashboard.controller";

const routes: IRoute[] = [
  {
    path: "/get-merchant-dashboard",
    method: "get",
    roles: [RoleEnum.Merchant, RoleEnum.Staff, RoleEnum.Admin],
    handler: merchantDashboardController.get_merchant_dashboard,
  },
  {
    path: "/trends-analytical-chart",
    method: "get",
    roles: [RoleEnum.Merchant, RoleEnum.Staff, RoleEnum.Admin],
    handler: merchantDashboardController.trends_analytical_chart,
  },
  {
    path: "/top-performance-destination",
    method: "get",
    roles: [RoleEnum.Merchant, RoleEnum.Staff, RoleEnum.Admin],
    handler: merchantDashboardController.top_performance_destination,
  },
  {
    path: "/five-recent-bookings",
    method: "get",
    roles: [RoleEnum.Merchant, RoleEnum.Staff, RoleEnum.Admin],
    handler: merchantDashboardController.five_recent_bookings,
  },
];

export const dashboardRoute = parseToExpressRoute(routes);
