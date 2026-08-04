import { busModel, IBus } from "../models/bus";
import { Controller } from "./controller";
export default class BusController extends Controller<IBus> {
  private static instance: BusController;
  private constructor() {
    super(busModel);
  }
  public static getInstance(): BusController {
    if (!BusController.instance) {
      BusController.instance = new BusController();
    }
    return BusController.instance;
  }
}
