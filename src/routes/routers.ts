import { Router } from "express";
import { userRoute } from "./users.route";
import { busRoute } from "./bus.route";
const appRouter = Router();
appRouter.use("/users", userRoute);
appRouter.use("/buses", busRoute);
export default appRouter;
