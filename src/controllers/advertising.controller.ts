import { advertisingModel, IAdvertising } from "../models/advertising";
import { Controller } from "./controller";
export default class AdvertisingController extends Controller<IAdvertising> {
  private static instance: AdvertisingController;
  private constructor() {
    super(advertisingModel);
  }
  public static getInstance(): AdvertisingController {
    if (!AdvertisingController.instance) {
      AdvertisingController.instance = new AdvertisingController();
    }
    return AdvertisingController.instance;
  }
}
