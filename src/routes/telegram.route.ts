import { Request, Response, Router } from "express";
import { sendMessageToTelegram } from "../utils/telegram.util";
import { getLinkQrForUser } from "../controllers/telegram.controller";
import { userController } from "../controllers/users.controller";
import { userModel } from "../models/users";
const routers = Router();

routers.post("/send-message", async (req, res) => {
  await sendMessageToTelegram(req.body.message);
  res.json({ success: true });
});
routers.get("/link-qr/:id", getLinkQrForUser);
routers.get("/check-user/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await userModel.findById(id);
  if (user?.telegram_chat_id) {
    res.json({ is_linked: true });
  } else {
    res.json({ is_linked: false });
  }
});
export const telegramRoute = routers;
