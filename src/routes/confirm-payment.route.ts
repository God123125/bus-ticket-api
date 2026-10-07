import { Request, Response } from "express";
import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import { responseServerError } from "../utils/log.util";
import { userModel } from "../models/users";
import { RoleEnum } from "../interfaces/role-enum";
import { verifyPayment } from "../controllers/telegram.controller";
import BookingController from "../controllers/booking.controller";
import { IBooking } from "../models/booking";
import crypto from "crypto";
import { sha256 } from "../middleware/hash-token";
const routes: IRoute[] = [
  {
    path: "/",
    method: "post",
    authentication: "optional",
    handler: async (req: Request, res: Response) => {
      try {
        const companyId = req.body.companyId;
        const owner = await userModel.findOne({
          company: companyId,
          role: RoleEnum.Merchant,
        });
        if (!owner) {
          return res.status(404).json({ msg: "Owner not found" });
        }
        const ownerChatId = owner.telegram_chat_id;
        const message = req.body.text;
        const token = crypto.randomBytes(24).toString("hex");
        const bookingData: any = {
          total_price: req.body.payment.totalAmount,
          booked_seats: req.body.trip.seats,
          trip: req.body.trip.tripId,
          user_info: req.body.passenger,
          company: req.body.companyId,
          booking_code: req.body.booking_code,
        };
        if (req.user) {
          bookingData.user = req.user;
        } else {
          bookingData.accessTokenHash = sha256(token);
        }
        const booking = (await BookingController.getInstance().create(
          bookingData,
        )) as unknown as IBooking;
        await verifyPayment(
          ownerChatId as string,
          message,
          booking._id as string,
        );
        res.json({
          msg: "Payment confirmation sent successfully",
          access_token: sha256(token),
          success: true,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const confirmPaymentRoute = parseToExpressRoute(routes);
