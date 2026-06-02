import { Router } from "express";
import { busController } from "../controllers/buses.controller";
const routes = Router();
routes.get("/", busController.getMany);
routes.post("/", busController.create);
routes.patch("/:id", busController.update);
routes.delete("/:id", busController.delete);
routes.get("/:id", busController.delete);
export const busRoute = routes;
