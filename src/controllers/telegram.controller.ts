import crypto from "crypto";
import { telegramTokenModel } from "../models/telegram-token";
import "dotenv/config";
import QRCode from "qrcode";
import axios from "axios";
import { userModel } from "../models/users";
import { Request, Response } from "express";
import BookingController from "./booking.controller";
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME; //
export const generateLinkToken = async (userId: string): Promise<string> => {
  const token = crypto.randomBytes(16).toString("hex");
  await telegramTokenModel.create({
    token,
    userId,
  });

  return token;
};
export const generateTelegramLinkQr = async (
  token: string,
): Promise<string> => {
  if (!TELEGRAM_BOT_USERNAME) {
    throw new Error("TELEGRAM_BOT_USERNAME env var is not set");
  }

  const deepLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${token}`;
  const qrDataUrl = await QRCode.toDataURL(deepLink, {
    width: 300,
    margin: 2,
  });

  return qrDataUrl; // base64 PNG data URL — send directly to frontend <img src="...">
};
export const getLinkQrForUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id as string;

    const token = await generateLinkToken(userId);
    const qrDataUrl = await generateTelegramLinkQr(token);

    res.status(200).json({ qrDataUrl, expiresInMinutes: 15 });
  } catch (e) {
    console.log("getLinkQrForUser error:", e);
    res.status(500).json({ message: "Failed to generate linking QR" });
  }
};
export const sendMessageToUser = async (
  chatId: number | string,
  text: string,
) => {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text,
    });
  } catch (e) {
    console.log("Telegram sendMessage error:", e);
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
        if (update.message?.text?.startsWith("/start")) {
          const message = update.message;
          const parts = message.text.split(" ");
          const token = parts[1];
          const chatId = message.chat.id;
          const from = message.from;
          const telegramUser = await telegramTokenModel.findOne({ token });
          if (telegramUser) {
            const user = await userModel.findById(telegramUser.userId);
            if (user) {
              user.telegram_chat_id = chatId;
              user.telegram_username = from.username
                ? from.username
                : `${from.last_name} ${from.first_name}`;
              await user.save();
              await sendMessageToUser(
                chatId,
                `✅ Thanks ${from.first_name} ${from.last_name}, your account is now linked! You'll receive payment confirmation requests here.`,
              );
            }
          }
        }
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

            await BookingController.getInstance().update(
              { _id: bookingId },
              {
                status: "CONFIRMED",
              },
            );

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

            await BookingController.getInstance().update(
              { _id: bookingId },
              {
                status: "REJECTED",
              },
            );

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
