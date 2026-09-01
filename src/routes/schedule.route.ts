import { Request, Response } from "express";
import { RoleEnum } from "../interfaces/role-enum";
import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import { responseServerError } from "../utils/log.util";
import ScheduleController from "../controllers/schedule-destination.controller";
import { IPaginationForm } from "../interfaces/pagination";
import { ISchedule } from "../models/schedule-destination";
import {
  deleteFromCloudinary,
  upload,
  uploadToCloudinary,
} from "../config/cloudinary";
import TripController from "../controllers/trip.controller";
const routes: IRoute[] = [
  {
    path: "/landing-schedule",
    method: "get",
    authentication: false,
    handler: async (req: Request, res: Response) => {
      try {
        // const data = await ScheduleController.getInstance()
        //   .getMany({})
        //   .populate([
        //     { path: "departure_station", select: "station_name" },
        //     { path: "arrival_station", select: "station_name" },
        //     { path: "company", select: ["name", "image"] },
        //     { path: "from" },
        //     { path: "to" },
        //   ])
        //   .limit(4)
        //   .select("-imagePublicId");
        const data =
          await TripController.getInstance().getMostFourPopularSchedule();
        res.json(data);
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/",
    method: "post",
    roles: [RoleEnum.Merchant, RoleEnum.Staff],
    middleware: upload.single("image"),
    handler: async (req: Request, res: Response) => {
      try {
        let img = "";
        let imgPublicId = "";
        if (req.file) {
          const { url, publicId } = await uploadToCloudinary(
            req.file.buffer,
            "schedules",
          );
          img = url;
          imgPublicId = publicId;
        }
        const body = {
          ...req.body,
          company: req.company,
          image: img,
          imagePublicId: imgPublicId,
        };
        const data = await ScheduleController.getInstance().create(body);
        res.json({
          msg: "Schedule created successfully",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/",
    method: "get",
    roles: [RoleEnum.Merchant, RoleEnum.Staff],
    handler: async (req: Request, res: Response) => {
      try {
        const pagination: IPaginationForm = {
          page: Number(req.query.page) || 1,
          limit: Number(req.query.limit) || 10,
        };
        const search = req.query.search;
        let query: any = { company: req.company };
        if (search) {
          query.$or = [
            { from: { $regex: search, $options: "i" } },
            { to: { $regex: search, $options: "i" } },
          ];
        }
        const data = await ScheduleController.getInstance()
          .getMany({
            pagination,
            query,
            sort: { createdAt: -1 },
          })
          .populate([
            { path: "departure_station", select: "station_name" },
            { path: "arrival_station", select: "station_name" },
            { path: "from" },
            { path: "to" },
          ]);
        const total = await ScheduleController.getInstance().count(query);
        res.json({
          list: data,
          total: total,
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
        const data = await ScheduleController.getInstance()
          .getById(id)
          .populate([
            { path: "departure_station", select: "station_name" },
            { path: "arrival_station", select: "station_name" },
            { path: "from" },
            { path: "to" },
          ]);
        res.json(data);
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "patch",
    roles: [RoleEnum.Merchant, RoleEnum.Staff],
    middleware: upload.single("image"),
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const body: Partial<ISchedule> = req.body;
        if (req.file) {
          const existing = await ScheduleController.getInstance().getById(id);
          if (existing?.imagePublicId) {
            await deleteFromCloudinary(existing.imagePublicId);
          }
          const { url, publicId } = await uploadToCloudinary(
            req.file.buffer,
            "schedules",
          );
          body.image = url;
          body.imagePublicId = publicId;
        }
        const data = await ScheduleController.getInstance().update(
          { _id: id },
          body,
        );
        res.json({
          msg: "Schedule updated successfully",
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
        const existing = await ScheduleController.getInstance().getById(id);
        if (existing?.imagePublicId) {
          await deleteFromCloudinary(existing.imagePublicId);
        }
        const data = await ScheduleController.getInstance().delete({ _id: id });
        res.json({
          msg: "Schedule deleted successfully",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const scheduleRoute = parseToExpressRoute(routes);
