import { Router } from "express";
import { scheduleController } from "../controllers/schedule-destination.controller";
const routes = Router();
routes.get("/", scheduleController.getMany);
routes.post("/", scheduleController.create);
routes.patch("/:id", scheduleController.update);
routes.delete("/:id", scheduleController.delete);
export const scheduleRoute = routes;
