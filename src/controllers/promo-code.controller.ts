import { IPromoCode, promoCodeModel } from "../models/promo-code";
import { Controller } from "./controller";

export default class PromoCodeController extends Controller<IPromoCode> {
  private static instance: PromoCodeController;
  private constructor() {
    super(promoCodeModel);
  }
  public static getInstance(): PromoCodeController {
    if (!PromoCodeController.instance) {
      PromoCodeController.instance = new PromoCodeController();
    }
    return PromoCodeController.instance;
  }
}
