import { Request, Response } from "express";
import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import { responseServerError } from "../utils/log.util";
import AdvertisingController from "../controllers/advertising.controller";
import { IPaginationForm } from "../interfaces/pagination";
import { IAdvertising } from "../models/advertising";
import { RoleEnum } from "../interfaces/role-enum";
import {
  deleteFromCloudinary,
  upload,
  uploadToCloudinary,
} from "../config/cloudinary";

const routes: IRoute[] = [
  {
    path: "/",
    method: "get",
    roles: [RoleEnum.Admin],
    handler: async (req: Request, res: Response) => {
      try {
        const pagination: IPaginationForm = req.query;
        const ads = await AdvertisingController.getInstance().getMany({
          pagination,
        });
        const total = AdvertisingController.getInstance().count();
        res.json({
          list: ads,
          total,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/",
    method: "post",
    roles: [RoleEnum.Admin],
    middleware: upload.single("image"),
    handler: async (req: Request, res: Response) => {
      try {
        const { url, publicId } = await uploadToCloudinary(
          req.file?.buffer!,
          "advertisings",
        );
        const body: IAdvertising = {
          ...req.body,
          image: url,
          imagePublicId: publicId,
        };
        const data = await AdvertisingController.getInstance().create(body);
        res.json({
          msg: "Advertising created successfully!",
          data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "patch",
    roles: [RoleEnum.Admin],
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const ad = await AdvertisingController.getInstance().getById(id);
        if (!ad) return res.status(404).json({ msg: "Advertising not found!" });
        if (req.file) {
          if (ad.imagePublicId) {
            await deleteFromCloudinary(ad.imagePublicId);
          }
          const { url, publicId } = await uploadToCloudinary(
            req.file.buffer,
            "advertisings",
          );
          ad.image = url;
          ad.imagePublicId = publicId;
        }
        ad.description = req.body.description ?? ad.description;
        await ad.save();
        res.json({
          msg: "Advertising updated successfully!",
          data: ad,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "delete",
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const ad = await AdvertisingController.getInstance().getById(id);
        if (!ad) return res.status(404).json({ msg: "Advertising not found!" });
        await AdvertisingController.getInstance().delete({ _id: id });
        res.json({
          msg: "Advertising deleted successfully",
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const advertisingRoute = parseToExpressRoute(routes);
