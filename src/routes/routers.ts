import { Router } from "express";
import { userRoute } from "./users.route";
import { busRoute } from "./bus.route";
import { seatRoute } from "./seat.route";
const appRouter = Router();
appRouter.use("/users", userRoute);
appRouter.use("/buses", busRoute);
appRouter.use("/seats", seatRoute);
export default appRouter;
