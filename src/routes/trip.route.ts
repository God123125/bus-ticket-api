import { Request, Response } from "express";
import { IRoute } from "../interfaces/route";
import { responseServerError } from "../utils/log.util";
import { parseToExpressRoute } from "../utils/route.util";
import TripController from "../controllers/trip.controller";
import { RoleEnum } from "../interfaces/role-enum";
import { IPaginationForm } from "../interfaces/pagination";
import { ITrip } from "../models/trip";
import { parseStringArray } from "../utils/parse-string-array.util";
import ScheduleController from "../controllers/schedule-destination.controller";

function getISODateRange(dateValue?: any) {
  if (!dateValue) return undefined;
  const d = new Date(String(dateValue));
  if (isNaN(d.getTime())) return undefined;

  const start = new Date(d);
  start.setHours(0, 0, 0, 0);

  const end = new Date(d);
  end.setHours(23, 59, 59, 999);

  return {
    $gte: start.toISOString(),
    $lte: end.toISOString(),
  };
}

const routes: IRoute[] = [
  {
    path: "/by-schedule",
    method: "get",
    authentication: false,
    handler: async (req: Request, res: Response) => {
      try {
        const schedule = req.query.schedule as string;
        const from = req.query.from as string;
        const to = req.query.to as string;
        const departure_date = req.query.departure_date;
        const return_date = req.query.return_date;
        let query: any = {};

        const departureRange = getISODateRange(departure_date);
        const returnRange = getISODateRange(return_date);

        if (schedule) {
          query.schedule = schedule;
          if (departureRange) {
            query.departure_date = departureRange;
          }
        } else if (from && to) {
          const outboundSchedules =
            await ScheduleController.getInstance().getMany({
              query: { from: from, to: to },
            });
          const outboundScheduleIds = outboundSchedules.map((item) => item._id);

          const orConditions: any[] = [];

          if (outboundScheduleIds.length > 0) {
            const outboundCondition: any = {
              schedule: { $in: outboundScheduleIds },
            };
            if (departureRange) {
              outboundCondition.departure_date = departureRange;
            }
            orConditions.push(outboundCondition);
          }

          if (return_date) {
            const returnSchedules =
              await ScheduleController.getInstance().getMany({
                query: { from: to, to: from },
              });
            const returnScheduleIds = returnSchedules.map((item) => item._id);
            if (returnScheduleIds.length > 0) {
              const returnCondition: any = {
                schedule: { $in: returnScheduleIds },
              };
              if (returnRange) {
                returnCondition.departure_date = returnRange;
              }
              orConditions.push(returnCondition);
            }
          }
          if (orConditions.length > 0) {
            query = { $or: orConditions };
          } else {
            return res.json([]);
          }
        }
        const data = await TripController.getInstance()
          .getMany({
            query: query,
          })
          .populate([
            { path: "bus" },
            {
              path: "schedule",
              populate: [{ path: "from" }, { path: "to" }],
              select: ["-imagePublicId"],
            },
            { path: "company", select: ["name", "image"] },
          ]);
        res.json(data);
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/detail/:id",
    method: "get",
    authentication: false,
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        // const data = await TripController.getInstance()
        //   .getById(id)
        //   .populate([
        //     { path: "bus", select: ["-images.publicId"] },
        //     { path: "schedule", populate: [{ path: "from" }, { path: "to" }] },
        //     { path: "company", select: ["name", "image"] },
        //   ]);
        const data = await TripController.getInstance().getByTripId(id);
        if (!data) {
          return res.status(404).json({ message: "Trip not found" });
        }
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
    handler: async (req: Request, res: Response) => {
      try {
        const body: ITrip = {
          ...req.body,
          company: req.company,
          amenities: parseStringArray(req.body.amenities),
          price_per_seat:
            Number(req.body.price_per_seat) -
            Number(req.body.price_per_seat) * Number(req.body.discount ?? 0),
        };
        const data = await TripController.getInstance().create(body);
        res.json({
          msg: "Trip created successfully",
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
        let query: any = { company: req.company };
        if (req.query.departure_date) {
          const startDate = new Date(req.query.departure_date as string);
          startDate.setHours(0, 0, 0, 0);

          const endDate = new Date(req.query.departure_date as string);
          endDate.setHours(23, 59, 59, 999);

          query.departure_date = {
            $gte: startDate,
            $lte: endDate,
          };
        }
        if (req.query.schedule) {
          query.schedule = req.query.schedule;
        }
        const list = await TripController.getInstance()
          .getMany({ query, pagination, sort: { createdAt: -1 } })
          .select("-company")
          .populate({
            path: "schedule",
            populate: [{ path: "from" }, { path: "to" }],
            select: "-imagePublicId",
          })
          .populate("bus");
        const total = await TripController.getInstance().count(query);
        res.json({ list: list, total: total });
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
        const data = await TripController.getInstance()
          .getOne({ query: { _id: id, company: req.company } })
          .populate([
            { path: "bus" },
            {
              path: "schedule",
              populate: [{ path: "from" }, { path: "to" }],
              select: "-imagePublicId",
            },
          ])
          .select(["-company", "-imagePublicId"]);
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
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const body: Partial<ITrip> = {
          ...req.body,
          amenities: parseStringArray(req.body.amenities),
          price_per_seat:
            Number(req.body.price_per_seat) -
            Number(req.body.price_per_seat) * Number(req.body.discount ?? 0),
        };

        const data = await TripController.getInstance().update(
          { _id: id, company: req.company },
          body,
        );
        res.json({
          msg: "Trip updated successfully",
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
        const data = await TripController.getInstance().delete({
          _id: id,
        });
        res.json({
          msg: "Trip deleted successfully",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const tripRoute = parseToExpressRoute(routes);
