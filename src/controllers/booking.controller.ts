import { bookingModel, IBooking } from "../models/booking";
import { Controller } from "./controller";
export default class BookingController extends Controller<IBooking> {
  private static instance: BookingController;
  private constructor() {
    super(bookingModel);
  }
  public static getInstance(): BookingController {
    if (!BookingController.instance) {
      BookingController.instance = new BookingController();
    }
    return BookingController.instance;
  }
}
