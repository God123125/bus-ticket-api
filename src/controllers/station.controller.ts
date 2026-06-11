import { Request, Response } from "express";
import { IStation, stationModel } from "../models/station";
import { responseServerError } from "../utils/log.util";
export const stationController = {
  create: async (req: Request, res: Response) => {
    try {
      const body: IStation = { ...req.body, company: req.company };
      const data = await stationModel.create(body);
      res.json({
        msg: "Station created successfully",
        data: data,
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const body: Partial<IStation> = req.body;
      await stationModel.findByIdAndUpdate(id, body);
      res.json({
        msg: "Station updated successfully",
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await stationModel.findByIdAndDelete(id);
      res.json({
        msg: "Station deleted successfully",
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
};
