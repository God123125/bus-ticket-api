import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import { RoleEnum } from "../interfaces/role-enum";
import { responseServerError } from "../utils/log.util";
import { Request, Response } from "express";
import CompanyController from "../controllers/company.controller";
import { ICompany } from "../models/company";
import {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary";
import { IPaginationForm } from "../interfaces/pagination";

const routes: IRoute[] = [
  {
    path: "/",
    method: "get",
    roles: [RoleEnum.Admin],
    handler: async (req: Request, res: Response) => {
      try {
        const search = req.query.search;
        const pagination: IPaginationForm = req.query;
        let query: any = {};
        if (search) {
          query.name = { $regex: search, $options: "i" };
        }
        const list = await CompanyController.getInstance()
          .getMany({
            query,
            pagination,
            sort: { createdAt: -1 },
            select: ["-imagePublicId"],
          })
          .populate([{ path: "owner", select: ["-password", "-__v"] }]);
        const total = await CompanyController.getInstance().count(query);
        res.json({ list, total });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/",
    method: "post",
    roles: [RoleEnum.Admin],
    middleware: upload.fields([
      { name: "image", maxCount: 1 },
      { name: "khqrImage", maxCount: 1 },
    ]),
    handler: async (req: Request, res: Response) => {
      try {
        let imageUrl = "";
        let publicId = "";
        let khqrImageUrl = "";
        let khqrPublicId = "";
        const files = req.files as {
          image?: Express.Multer.File[];
          khqrImage?: Express.Multer.File[];
        };

        if (files?.image?.[0]) {
          const cloudRes = await uploadToCloudinary(
            files.image[0].buffer,
            "companies",
          );
          imageUrl = cloudRes.url;
          publicId = cloudRes.publicId;
        }

        if (files?.khqrImage?.[0]) {
          const cloudRes2 = await uploadToCloudinary(
            files.khqrImage[0].buffer,
            "companies",
          );
          khqrImageUrl = cloudRes2.url;
          khqrPublicId = cloudRes2.publicId;
        }

        const body: ICompany = req.body;
        const data = await CompanyController.getInstance().create({
          ...body,
          image: imageUrl,
          imagePublicId: publicId,
          khqrImage: khqrImageUrl,
          khqrImagePublicId: khqrPublicId,
          owner: req.body.owner,
        });
        res.json({ msg: "Company created successfully!", data: data });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "get",
    roles: [RoleEnum.Admin],
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const data = await CompanyController.getInstance()
          .getById(id)
          .select(["-imagePublicId", "-khqrImagePublicId"]);
        res.json(data);
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/payment/:id",
    method: "get",
    authentication: false,
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const data = await CompanyController.getInstance()
          .getById(id)
          .select(["-imagePublicId", "-khqrImagePublicId", "khqrImage"]);
        res.json(data);
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "patch",
    roles: [RoleEnum.Admin, RoleEnum.Merchant],
    middleware: upload.fields([
      { name: "image", maxCount: 1 },
      { name: "khqrImage", maxCount: 1 },
    ]),
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const body: Partial<ICompany> = req.body;
        const files = req.files as {
          image?: Express.Multer.File[];
          khqrImage?: Express.Multer.File[];
        };

        const existing =
          files?.image?.[0] || files?.khqrImage?.[0]
            ? await CompanyController.getInstance().getOne({
                query: { _id: id },
              })
            : null;

        if (files?.image?.[0]) {
          if (existing?.imagePublicId) {
            await deleteFromCloudinary(existing.imagePublicId);
          }
          const cloudRes = await uploadToCloudinary(
            files.image[0].buffer,
            "companies",
          );
          body.image = cloudRes.url;
          body.imagePublicId = cloudRes.publicId;
        }

        if (files?.khqrImage?.[0]) {
          if (existing?.khqrImagePublicId) {
            await deleteFromCloudinary(existing.khqrImagePublicId);
          }
          const cloudRes2 = await uploadToCloudinary(
            files.khqrImage[0].buffer,
            "companies",
          );
          body.khqrImage = cloudRes2.url;
          body.khqrImagePublicId = cloudRes2.publicId;
        }

        const data = await CompanyController.getInstance().update(
          { _id: id },
          body,
        );
        res.json({ msg: "Company updated successfully!", data: data });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "delete",
    roles: [RoleEnum.Admin],
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const company = await CompanyController.getInstance().getOne({
          query: { _id: id },
        });
        if (company?.imagePublicId) {
          await deleteFromCloudinary(company.imagePublicId);
        }
        if (company?.khqrImagePublicId) {
          await deleteFromCloudinary(company.khqrImagePublicId);
        }
        await CompanyController.getInstance().delete({ _id: id });
        res.json({ msg: "Company deleted successfully!" });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
];
export const companyRoute = parseToExpressRoute(routes);
