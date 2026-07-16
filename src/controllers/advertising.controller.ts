import { Request, Response } from "express";
import { advertisingModel, IAdvertising } from "../models/advertising";
import { responseServerError } from "../utils/log.util";
import { Controller } from "./controller";
export default class AdvertisingController extends Controller<IAdvertising> {
  private static instance: AdvertisingController;
  private constructor() {
    super(advertisingModel);
  }
  public static getInstance(): AdvertisingController {
    if (!AdvertisingController.instance) {
      AdvertisingController.instance = new AdvertisingController();
    }
    return AdvertisingController.instance;
  }
}
// export const advertisingController = {
//   getMany: async (req: Request, res: Response) => {
//     try {
//       const ads = await advertisingModel.find({
//         company: req.get("company") as string,
//       });
//       res.json({
//         list: ads,
//       });
//     } catch (e: any) {
//       responseServerError(res, e);
//     }
//   },
//   create: async (req: Request, res: Response) => {
//     try {
//       const body: IAdvertising = { ...req.body, company: req.get("company") };
//       const data = await advertisingModel.create(body);
//       res.json({
//         msg: "Advertising created successfully",
//         data: data,
//       });
//     } catch (e: any) {
//       responseServerError(res, e);
//     }
//   },
//   update: async (req: Request, res: Response) => {
//     try {
//       const body: Partial<IAdvertising> = req.body;
//       const id = req.params.id;
//       await advertisingModel.findByIdAndUpdate(id, body);
//       res.json({
//         msg: "Advertising updated successfully",
//       });
//     } catch (e: any) {
//       responseServerError(res, e);
//     }
//   },
//   delete: async (req: Request, res: Response) => {
//     try {
//       const id = req.params.id;
//       await advertisingModel.findByIdAndDelete(id);
//       res.json({
//         msg: "Advertising deleted successfully",
//       });
//     } catch (e: any) {
//       responseServerError(res, e);
//     }
//   },
// };
