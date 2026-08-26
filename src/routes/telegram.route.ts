import { Router } from "express";
import { sendMessageToTelegram } from "../utils/telegram.util";
import { telegramWebhook } from "../controllers/telegram.controller";
const routers = Router();

routers.post("/send-message", async (req, res) => {
  await sendMessageToTelegram(req.body.message);
  res.json({ success: true });
});
routers.post("/webhook", telegramWebhook);
export const telegramRoute = routers;
