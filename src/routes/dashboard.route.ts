import { Router } from "express";
import { merchantDashboardController } from "../controllers/dashboard.controller";
const routes = Router();

routes.get(
  "/get-merchant-dashboard",
  merchantDashboardController.get_merchant_dashboard,
);
routes.get(
  "/trends-analytical-chart",
  merchantDashboardController.trends_analytical_chart,
);
routes.get(
  "/top-performance-destination",
  merchantDashboardController.top_performance_destination,
);
routes.get(
  "/five-recent-booking",
  merchantDashboardController.five_recent_booking,
);

export const dashboardRoute = routes;
