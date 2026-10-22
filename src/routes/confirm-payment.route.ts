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
import PromoCodeController from "../controllers/promo-code.controller";
import { promoRedemptionModel } from "../models/promo-redemption";
import { Types } from "mongoose";
import { DiscountTypeEnum } from "../interfaces/discount-type-enum";
import { tripModel } from "../models/trip";
const routes: IRoute[] = [
  {
    path: "/",
    method: "post",
    authentication: "optional",
    handler: async (req: Request, res: Response) => {
      try {
        const { companyId, booking_code, passenger, promo_id } = req.body;
        const trip = req.body.trip;
        const payment = req.body.payment;
        let finalPrice = payment.totalAmount;
        let redemption: any = null;
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
        const tripData = await tripModel.findById(trip?.tripId);
        if (!tripData) return res.status(404).json({ msg: "Trip not found" });

        if (promo_id) {
          if (!req.user)
            return res
              .status(400)
              .json({ msg: "Login required to use a promo code" });

          const promoCode = await PromoCodeController.getInstance().getOne({
            query: { _id: promo_id, expiresAt: { $gt: new Date() } },
          });
          if (!promoCode)
            return res.status(400).json({ msg: "Promo code not found" });
          finalPrice =
            promoCode.discountType === DiscountTypeEnum.PERCENTAGE
              ? finalPrice * (1 - promoCode.value / 100)
              : finalPrice - promoCode.value;
          try {
            redemption = await promoRedemptionModel.findOneAndUpdate(
              {
                promo_code: new Types.ObjectId(promoCode._id as string),
                user: new Types.ObjectId(req.user as string),
                useCount: { $lt: promoCode.maxUses },
              },
              { $inc: { useCount: 1 } },
              { upsert: true, new: true, rawResult: true },
            );
          } catch (e: any) {
            // limit reached -> filter misses -> upsert hits the unique index
            if (e.code === 11000) {
              return res
                .status(400)
                .json({ msg: "Promo code is used", success: false });
            }
            responseServerError(res, e);
          }
        }
        const bookingData: any = {
          total_price: finalPrice,
          booked_seats: trip.seats,
          trip: trip.tripId,
          user_info: passenger,
          company: companyId,
          booking_code: booking_code,
        };
        if (req.user) bookingData.user = req.user;
        else bookingData.accessTokenHash = sha256(token);
        let booking: any = {};
        booking = (await BookingController.getInstance().create(
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
