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
  {
    path: "/merchant-summary-card",
    method: "get",
    roles: [RoleEnum.Merchant, RoleEnum.Staff, RoleEnum.Admin],
    handler: merchantDashboardController.count_property_for_each_company,
  },
  {
    path: "/booking-status-distribution",
    method: "get",
    roles: [RoleEnum.Merchant, RoleEnum.Staff, RoleEnum.Admin],
    handler: merchantDashboardController.booking_status_distribution,
  },
  //admin route
  {
    path: "/admin-summary-card",
    method: "get",
    roles: [RoleEnum.Admin, RoleEnum.Merchant, RoleEnum.Staff],
    handler: merchantDashboardController.count_user_and_company,
  },
  {
    path: "/company-comparison",
    method: "get",
    roles: [RoleEnum.Admin, RoleEnum.Merchant, RoleEnum.Staff],
    handler: merchantDashboardController.company_comparison_doughnut_chart,
  },
  {
    path: "/top-booking-company",
    method: "get",
    roles: [RoleEnum.Admin, RoleEnum.Merchant, RoleEnum.Staff],
    handler: merchantDashboardController.top_booking_company_bar_chart,
  },
  {
    path: "/yearly-commission",
    method: "get",
    roles: [RoleEnum.Admin, RoleEnum.Merchant, RoleEnum.Staff],
    handler: merchantDashboardController.yearly_commission_income,
  },
];

export const dashboardRoute = parseToExpressRoute(routes);
