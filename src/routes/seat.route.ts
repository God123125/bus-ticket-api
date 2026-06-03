import { Router } from "express";
import { seatController } from "../controllers/seats.controller";
const routes = Router();
routes.get("/", seatController.getMany);
routes.post("/", seatController.create);
routes.patch("/:id", seatController.update);
routes.delete("/:id", seatController.delete);
export const seatRoute = routes;
