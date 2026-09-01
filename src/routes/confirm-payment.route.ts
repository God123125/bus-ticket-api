import { Request, Response } from "express";
import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import { responseServerError } from "../utils/log.util";
import { userModel } from "../models/users";
import { RoleEnum } from "../interfaces/role-enum";
import { verifyPayment } from "../controllers/telegram.controller";

const routes: IRoute[] = [
  {
    path: "/",
    method: "post",
    authentication: false,
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
        const message = `
            🔔 Payment Confirmation
            👤 Customer Bank Name: ${req.body.bank_acc_name}
            👤 Customer Bank Account Number: ${req.body.bank_acc_number}
            💰 Amount: ${req.body.amount}
            ℹ️ សម្គាល់ៈ សូមឆែកមើលគណនីរបស់អ្នកដើម្បីបញ្ជាក់ការទូទាត់។
        `;
        await verifyPayment(ownerChatId as string, message);
        res.json({
          msg: "Payment confirmation sent successfully",
          success: true,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const confirmPaymentRoute = parseToExpressRoute(routes);
