import { Request, Response } from "express";
import { ISeat, seatModel } from "../models/seat";
import { responseServerError } from "../utils/log.util";
export const seatController = {
  getMany: async (req: Request, res: Response) => {
    try {
      const seats = await seatModel.find();
      res.json({
        list: seats,
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const body: ISeat = req.body;
      const exist = await seatModel.exists({ seat_no: body.seat_no });
      if (exist) return res.status(400).json({ msg: "Seat already existed" });
      const newSeat = await seatModel.create(body);
      res.json({ msg: "Seat created successfully", data: newSeat });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const body: Partial<ISeat> = req.body;
      await seatModel.findByIdAndUpdate(id, body);
      res.json({
        msg: "Seat updated successfully",
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await seatModel.findByIdAndDelete(id);
      res.json({
        msg: "Seat delete successfully!",
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
};
