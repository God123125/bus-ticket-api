import { Request, Response, Router } from "express";
import { upload } from "../config/cloudinary";
import { userController } from "../controllers/users.controller";
const routers = Router();
routers.get("/", async (req: Request, res: Response) => {
  res.json({ msg: "test route" });
});
routers.post("/", upload.single("profile"), userController.create);
export const userRoute = routers;
