import { Request, Response } from "express";
import { answerCallbackQuery, removeButtons } from "../utils/telegram.util";

// Replace these with your real database functions
const approveBooking = async (bookingId: string = "testing") => {
  console.log("Approving booking:", bookingId);

  // Example:
  //
  // await Booking.findByIdAndUpdate(
  //   bookingId,
  //   {
  //     status: "CONFIRMED"
  //   }
  // );
};

const rejectBooking = async (bookingId: string = "testing") => {
  console.log("Rejecting booking:", bookingId);

  // Example:
  //
  // await Booking.findByIdAndUpdate(
  //   bookingId,
  //   {
  //     status: "REJECTED"
  //   }
  // );
};

export const telegramWebhook = async (req: Request, res: Response) => {
  try {
    const update = req.body;

    console.log("Telegram update:", JSON.stringify(update, null, 2));

    // Check whether this update is a button click
    if (update.callback_query) {
      const callbackQuery = update.callback_query;

      const callbackQueryId = callbackQuery.id;
      const callbackData = callbackQuery.data;

      const message = callbackQuery.message;

      console.log("Callback data:", callbackData);

      /*
       * APPROVE
       */
      if (callbackData === "approve_booking" || callbackData.startsWith("approve_booking_")) {
        const bookingId = callbackData.startsWith("approve_booking_")
          ? callbackData.replace("approve_booking_", "")
          : "testing";

        console.log("Approve booking:", bookingId);

        await approveBooking(bookingId);

        await answerCallbackQuery(callbackQueryId, "✅ Booking approved!");

        if (message) {
          await removeButtons(message.chat.id, message.message_id);
        }
      } else if (callbackData === "reject_booking" || callbackData.startsWith("reject_booking_")) {
        /*
         * REJECT
         */
        const bookingId = callbackData.startsWith("reject_booking_")
          ? callbackData.replace("reject_booking_", "")
          : "testing";

        console.log("Reject booking:", bookingId);

        await rejectBooking(bookingId);

        await answerCallbackQuery(callbackQueryId, "❌ Booking rejected!");

        if (message) {
          await removeButtons(message.chat.id, message.message_id);
        }
      }
    }

    // Telegram expects HTTP 200
    res.sendStatus(200);
  } catch (error) {
    console.error("Telegram webhook error:", error);

    res.sendStatus(500);
  }
};
