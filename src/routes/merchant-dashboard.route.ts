import { Router } from "express";
import { verifyToken } from "../auth/verify-token.service";
import { merchantDashboardController } from "../controllers/dashboard.controller";
const routes = Router();
routes.get(
  "/overall",
  verifyToken,
  merchantDashboardController.get_merchant_dashboard,
);
export const merchantDashboardRoute = routes;
