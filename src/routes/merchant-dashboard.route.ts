import { Router } from "express";
import { verifyToken } from "../auth/verify-token.service";
import { merchantDashboardController } from "../controllers/merchant-dashboard.controller";
const routes = Router();
routes.get("/overall", verifyToken, merchantDashboardController.get_overall);
export const merchantDashboardRoute = routes;
