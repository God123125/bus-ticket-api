import "dotenv/config";
import axios from "axios";
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
export const sendMessageToTelegram = async (message: string) => {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ Approve",
              callback_data: "approve_booking",
            },
            {
              text: "❌ Reject",
              callback_data: "reject_booking",
            },
          ],
        ],
      },
    });
  } catch (e) {
    console.log(e);
  }
};

/**
 * Set Telegram webhook
 */
export const setTelegramWebhook = async (webhookUrl: string) => {
  try {
    const response = await axios.post(`${TELEGRAM_API}/setWebhook`, {
      url: webhookUrl,
    });

    console.log("Telegram webhook:", response.data);

    return response.data;
  } catch (error) {
    console.error("Failed to set Telegram webhook:", error);
    throw error;
  }
};
export const deleteWebhook = async () => {
  await axios.post(`${TELEGRAM_API}/deleteWebhook`);

  console.log("Webhook deleted");
};
