import { Router } from "express";
import { userRoute } from "./users.route";
const appRouter = Router();
appRouter.use("/users", userRoute);
export default appRouter;
