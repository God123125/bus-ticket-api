import { Request, Response } from "express";
import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import { responseServerError } from "../utils/log.util";
import BusController from "../controllers/buses.controller";
import { IBus, IBusImage } from "../models/bus";
import { IPaginationForm } from "../interfaces/pagination";
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
    roles: [RoleEnum.Merchant, RoleEnum.Staff],
    handler: async (req: Request, res: Response) => {
      try {
        const search = (req.query.search as string) || "";
        const pagination: IPaginationForm = {
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 10,
        };
        const buses = await BusController.getInstance()
          .getMany({
            pagination,
            query: {
              company: req.company,
              model_name: { $regex: search, $options: "i" },
            },
          })
          .select(" -company ");
        const total = await BusController.getInstance().count({
          company: req.company,
          model_name: { $regex: search, $options: "i" },
        });
        res.json({
          list: buses,
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
    roles: [RoleEnum.Merchant, RoleEnum.Staff],
    middleware: upload.array("images", 3),
    handler: async (req: Request, res: Response) => {
      try {
        const files = req.files as Express.Multer.File[];
        let images: IBusImage[] = [];
        if (files && files.length > 0) {
          images = await Promise.all(
            files.map((file) => uploadToCloudinary(file.buffer, "buses")),
          );
        }
        const body: IBus = { ...req.body, company: req.company, images };
        const data = await BusController.getInstance().create(body);
        res.json({
          msg: "Bus created successfully!",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "patch",
    roles: [RoleEnum.Merchant, RoleEnum.Staff],
    middleware: upload.array("images", 3),
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const bus = await BusController.getInstance().getById(id);
        if (!bus) return res.status(404).json({ msg: "Bus not found!" });
        const body: Partial<IBus> = { ...req.body };
        const files = req.files as Express.Multer.File[];
        if (files && files.length > 0) {
          if (bus.images && bus.images.length > 0) {
            await Promise.all(
              bus.images.map((img) => deleteFromCloudinary(img.publicId)),
            );
          }
          const images = await Promise.all(
            files.map((file) => uploadToCloudinary(file.buffer, "buses")),
          );
          body.images = images;
        }
        const data = await BusController.getInstance().update(
          { _id: id },
          body,
        );
        res.json({
          msg: "Bus updated successfully!",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "delete",
    roles: [RoleEnum.Merchant, RoleEnum.Staff],
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const bus = await BusController.getInstance().getById(id);
        if (!bus) return res.status(404).json({ msg: "Bus not found!" });
        if (bus.images && bus.images.length > 0) {
          await Promise.all(
            bus.images.map((img) => deleteFromCloudinary(img.publicId)),
          );
        }
        const data = await BusController.getInstance().delete({ _id: id });
        res.json({
          msg: "Bus deleted successfully!",
          data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "get",
    roles: [RoleEnum.Merchant, RoleEnum.Staff],
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const bus = await BusController.getInstance()
          .getById(id)
          .select("-company");
        if (!bus) return res.status(404).json({ msg: "Bus not found!" });
        res.json(bus);
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];

export const busRoute = parseToExpressRoute(routes);
