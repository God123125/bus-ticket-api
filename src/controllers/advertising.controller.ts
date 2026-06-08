import { Request, Response } from "express";
import { advertisingModel, IAdvertising } from "../models/advertising";
import { responseServeError } from "../utils/log.util";
export const advertisingController = {
  getMany: async (req: Request, res: Response) => {
    try {
      const ads = await advertisingModel.find({
        company: req.get("company") as string,
      });
      res.json({
        list: ads,
      });
    } catch (e: any) {
      responseServeError(res, e);
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const body: IAdvertising = { ...req.body, company: req.get("company") };
      const data = await advertisingModel.create(body);
      res.json({
        msg: "Advertising created successfully",
        data: data,
      });
    } catch (e: any) {
      responseServeError(res, e);
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const body: Partial<IAdvertising> = req.body;
      const id = req.params.id;
      await advertisingModel.findByIdAndUpdate(id, body);
      res.json({
        msg: "Advertising updated successfully",
      });
    } catch (e: any) {
      responseServeError(res, e);
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await advertisingModel.findByIdAndDelete(id);
      res.json({
        msg: "Advertising deleted successfully",
      });
    } catch (e: any) {
      responseServeError(res, e);
    }
  },
};
