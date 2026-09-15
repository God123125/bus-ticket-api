import { RoleEnum } from "../interfaces/role-enum";
import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import FeedbackController from "../controllers/feedback.controller";
import { Request, Response } from "express";
import { responseServerError } from "../utils/log.util";
import { IPaginationForm } from "../interfaces/pagination";
import {
  deleteFromCloudinary,
  upload,
  uploadToCloudinary,
} from "../config/cloudinary";

const routes: IRoute[] = [
  {
    path: "/",
    method: "get",
    roles: [RoleEnum.Admin, RoleEnum.Merchant],
    handler: async (req: Request, res: Response) => {
      try {
        const query: any = {};
        const pagination: IPaginationForm = {
          page: req.query.page,
          limit: req.query.limit,
        };
        if (req.company) {
          query.company = req.company;
        }
        const data = await FeedbackController.getInstance().getMany({
          pagination,
          query,
        });
        return res.status(200).json({
          msg: "Feedback fetched successfully!",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/",
    method: "post",
    authentication: false,
    middleware: upload.single("image"),
    handler: async (req: Request, res: Response) => {
      try {
        let imageUrl = "";
        let imagePublicId = "";
        if (req.file) {
          const image = await uploadToCloudinary(req.file.buffer, "feedbacks");
          imageUrl = image.url;
          imagePublicId = image.publicId;
        }
        const data = await FeedbackController.getInstance().create({
          ...req.body,
          image: imageUrl,
          imagePublicId: imagePublicId,
        });
        return res.status(200).json({
          msg: "Feedback created successfully!",
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
    authentication: false,
    middleware: upload.single("image"),
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id;
        const feedback = await FeedbackController.getInstance().getById(
          id as string,
        );
        if (!feedback) {
          return res.status(404).json({
            msg: "Feedback not found!",
          });
        }
        let imageUrl = "";
        let imagePublicId = "";
        if (req.file) {
          if (feedback.imagePublicId) {
            await deleteFromCloudinary(feedback.imagePublicId);
          }
          const image = await uploadToCloudinary(req.file.buffer, "feedbacks");
          imageUrl = image.url;
          imagePublicId = image.publicId;
        }
        const data = await FeedbackController.getInstance().update(
          { _id: id as string },
          {
            ...req.body,
            image: imageUrl,
            imagePublicId: imagePublicId,
          },
        );
        return res.status(200).json({
          msg: "Feedback updated successfully!",
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
    authentication: false,
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const feedback = await FeedbackController.getInstance().getById(id);
        if (!feedback) {
          return res.status(404).json({
            msg: "Feedback not found!",
          });
        }
        if (feedback.imagePublicId) {
          await deleteFromCloudinary(feedback.imagePublicId);
        }
        const data = await FeedbackController.getInstance().delete({
          _id: id as string,
        });
        return res.status(200).json({
          msg: "Feedback deleted successfully!",
          data: data,
        });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];

export const feedbackRoute = parseToExpressRoute(routes);
