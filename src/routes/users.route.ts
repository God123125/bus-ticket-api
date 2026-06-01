import { Request, Response, Router } from "express";
import { upload } from "../config/cloudinary";
import { userController } from "../controllers/users.controller";
const routers = Router();
routers.get("/", userController.getMany);
routers.post("/", upload.single("profile"), userController.create);
routers.patch("/:id", upload.single("profile"), userController.update);
export const userRoute = routers;
