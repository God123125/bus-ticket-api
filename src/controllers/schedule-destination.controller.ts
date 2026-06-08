import { Request, Response } from "express";
import { scheduleModel, ISchedule } from "../models/schedule-destination";
import { responseServeError } from "../utils/log.util";
export const scheduleController = {
  getMany: async (req: Request, res: Response) => {
    try {
      const schedules = await scheduleModel.find({
        company: req.get("company") as string,
      });
      res.json({
        list: schedules,
      });
    } catch (e: any) {
      responseServeError(res, e);
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const body: ISchedule = { ...req.body, company: req.get("company") };
      const data = await scheduleModel.create(body);
      res.json({
        msg: "Schedule created successfully!",
        data: data,
      });
    } catch (e: any) {
      responseServeError(res, e);
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const body: Partial<ISchedule> = req.body;
      await scheduleModel.findByIdAndUpdate(id, body);
      res.json({
        msg: "Schedule updated successfully!",
      });
    } catch (e: any) {
      responseServeError(res, e);
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await scheduleModel.findByIdAndDelete(id);
      res.json({
        msg: "Schedule deleted successfully!",
      });
    } catch (e: any) {
      responseServeError(res, e);
    }
  },
};
