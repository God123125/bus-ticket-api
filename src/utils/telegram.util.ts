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
export const answerCallbackQuery = async (
  callbackQueryId: string,
  text?: string,
) => {
  try {
    await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
      callback_query_id: callbackQueryId,
      text,
    });
  } catch (error) {
    console.error("Failed to answer callback query:", error);
  }
};

/**
 * Remove buttons from the Telegram message
 */
export const removeButtons = async (
  chatId: number | string,
  messageId: number,
) => {
  try {
    await axios.post(`${TELEGRAM_API}/editMessageReplyMarkup`, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [],
      },
    });
  } catch (error) {
    console.error("Failed to remove Telegram buttons:", error);
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
export const startTelegramPolling = async () => {
  let offset = 0;

  console.log("Telegram polling started");

  while (true) {
    try {
      const response = await axios.get(`${TELEGRAM_API}/getUpdates`, {
        params: {
          offset,
          timeout: 30,
        },
      });

      const updates = response.data.result;

      for (const update of updates) {
        /**
         * Important:
         * Move offset forward so we don't
         * process the same update again.
         */
        offset = update.update_id + 1;

        /**
         * Check for button click
         */
        if (update.callback_query) {
          const callbackQuery = update.callback_query;

          const callbackData = callbackQuery.data;

          console.log("Telegram button clicked:", callbackData);

          /**
           * APPROVE
           */
          if (
            callbackData === "approve_booking" ||
            callbackData.startsWith("approve_booking_")
          ) {
            const bookingId = callbackData.replace("approve_booking_", "");

            console.log("Approve booking:", bookingId);

            // TODO:
            // Update your database here
            //
            // await Booking.findByIdAndUpdate(
            //   bookingId,
            //   {
            //     status: "CONFIRMED"
            //   }
            // );

            await answerCallbackQuery(callbackQuery.id, "✅ Booking approved!");

            /**
             * Remove buttons
             */
            if (callbackQuery.message) {
              await removeButtons(
                callbackQuery.message.chat.id,
                callbackQuery.message.message_id,
              );
            }
          } else if (
            callbackData === "reject_booking" ||
            callbackData.startsWith("reject_booking_")
          ) {
            /**
             * REJECT
             */
            const bookingId = callbackData.replace("reject_booking_", "");

            console.log("Reject booking:", bookingId);

            // TODO:
            // Update your database
            //
            // await Booking.findByIdAndUpdate(
            //   bookingId,
            //   {
            //     status: "REJECTED"
            //   }
            // );

            await answerCallbackQuery(callbackQuery.id, "❌ Booking rejected!");

            /**
             * Remove buttons
             */
            if (callbackQuery.message) {
              await removeButtons(
                callbackQuery.message.chat.id,
                callbackQuery.message.message_id,
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Telegram polling error:", error);

      /**
       * Wait 5 seconds before retrying
       */
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};
