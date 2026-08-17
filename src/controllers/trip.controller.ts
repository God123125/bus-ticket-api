import { ITrip, tripModel } from "../models/trip";
import { Controller } from "./controller";

export default class TripController extends Controller<ITrip> {
  private static instance: TripController;
  private constructor() {
    super(tripModel);
  }
  public static getInstance(): TripController {
    if (!TripController.instance) {
      TripController.instance = new TripController();
    }
    return TripController.instance;
  }
}
