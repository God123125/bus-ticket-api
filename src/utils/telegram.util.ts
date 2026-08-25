import "dotenv/config";
import axios from "axios";
export const sendMessageToTelegram = async (message: string) => {
  try {
    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
      },
    );
  } catch (e) {
    console.log(e);
  }
};
