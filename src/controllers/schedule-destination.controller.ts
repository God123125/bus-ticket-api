import { scheduleModel, ISchedule } from "../models/schedule-destination";
import { Controller } from "./controller";
export default class ScheduleController extends Controller<ISchedule> {
  private static instance: ScheduleController;
  private constructor() {
    super(scheduleModel);
  }
  public static getInstance(): ScheduleController {
    if (!ScheduleController.instance) {
      ScheduleController.instance = new ScheduleController();
    }
    return ScheduleController.instance;
  }
}
