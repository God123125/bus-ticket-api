import { Router } from "express";
import { sendMessageToTelegram } from "../utils/telegram.util";
const routers = Router();

routers.post("/send-message", async (req, res) => {
  await sendMessageToTelegram(req.body.message);
  res.json({ success: true });
});
export const telegramRoute = routers;
