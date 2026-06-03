import { Request, Response } from "express";
import { busModel, IBus } from "../models/bus";
import { responseServeError } from "../utils/log.util";
export const busController = {
  getMany: async (req: Request, res: Response) => {
    try {
      const buses = await busModel.find();
      res.json({
        list: buses,
      });
    } catch (e: any) {
      responseServeError(res, e);
    }
  },
  getById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const bus = await busModel.findById(id);
      if (!bus) return res.json({ msg: "Bus not found!" });
      res.json(bus);
    } catch (e: any) {
      responseServeError(res, e);
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const body: IBus = req.body;
      const createdData = busModel.create(body);
      res.status(200).json({
        msg: "Bus created successfully!",
        data: createdData,
      });
    } catch (e: any) {
      responseServeError(res, e);
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const body: Partial<IBus> = req.body;
      const bus = await busModel.findById(id);
      if (!bus) return res.status(400).json({ msg: "Bus not found" });
      await bus.updateOne(body);
      res.json({
        msg: "Bus updated successfully",
      });
    } catch (e: any) {
      responseServeError(res, e);
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await busModel.findByIdAndDelete(id);
      res.json({
        msg: "Bus deleted successfully",
      });
    } catch (e: any) {
      responseServeError(res, e);
    }
  },
};
