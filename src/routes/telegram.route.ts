import { Router } from "express";
import { sendMessageToTelegram } from "../utils/telegram.util";
import { getLinkQrForUser } from "../controllers/telegram.controller";
const routers = Router();

routers.post("/send-message", async (req, res) => {
  await sendMessageToTelegram(req.body.message);
  res.json({ success: true });
});
routers.get("/link-qr/:id", getLinkQrForUser);
export const telegramRoute = routers;
