import { Request, Response, Router } from "express";
import { sendMessageToTelegram } from "../utils/telegram.util";
import { getLinkQrForUser } from "../controllers/telegram.controller";
import { userModel } from "../models/users";
const routers = Router();

routers.post("/send-message", async (req, res) => {
  await sendMessageToTelegram(req.body.message);
  res.json({ success: true });
});
routers.get("/link-qr/:id", getLinkQrForUser);
routers.get("/check-user/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await userModel.findById(id).select("telegram_chat_id").lean();
  res.json({ is_linked: Boolean(user?.telegram_chat_id) });
});
export const telegramRoute = routers;
