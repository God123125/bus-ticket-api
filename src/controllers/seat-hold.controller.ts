import { ISeatHold, seatHoldModel } from "../models/seat-hold";
import { Controller } from "./controller";

export default class SeatHoldController extends Controller<ISeatHold> {
  private static instance: SeatHoldController;
  private constructor() {
    super(seatHoldModel);
  }
  public static getInstance(): SeatHoldController {
    if (!SeatHoldController.instance) {
      SeatHoldController.instance = new SeatHoldController();
    }
    return SeatHoldController.instance;
  }
}
