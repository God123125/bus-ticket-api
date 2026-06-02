import { Request, Response } from "express";
import { busModel, IBus } from "../models/bus";
import { responseServeError } from "../utils/log.util";
export const busController = {
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
};
