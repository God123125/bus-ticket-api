import { IGeographic, geographicModel } from "../models/geographic";
import { Controller } from "./controller";

export default class GeographicController extends Controller<IGeographic> {
  private static instance: GeographicController;
  private constructor() {
    super(geographicModel);
  }
  public static getInstance(): GeographicController {
    if (!GeographicController.instance) {
      GeographicController.instance = new GeographicController();
    }
    return GeographicController.instance;
  }
}
