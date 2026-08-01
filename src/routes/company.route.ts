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

const routes: IRoute[] = [
  {
    path: "/",
    method: "get",
    roles: [RoleEnum.admin],
    handler: async (req: Request, res: Response) => {
      try {
        const search = req.query.search as string;
        const list = await CompanyController.getInstance()
          .getMany({
            query: { name: { $regex: search, $options: "i" } },
            pagination: req.query,
            sort: { createdAt: -1 },
            select: ["-imagePublicId"],
          })
          .populate([{ path: "owner" }]);
        const total = await CompanyController.getInstance().count();
        res.json({ list, total });
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/",
    method: "post",
    roles: [RoleEnum.admin],
    middleware: upload.single("image"),
    handler: async (req: Request, res: Response) => {
      try {
        let imageUrl = "";
        let publicId = "";

        if (req.file) {
          const cloudRes = await uploadToCloudinary(
            req.file.buffer,
            "companies",
          );
          imageUrl = cloudRes.url;
          publicId = cloudRes.publicId;
        }

        const body: ICompany = req.body;
        const data = await CompanyController.getInstance().create({
          ...body,
          image: imageUrl || body.image,
          imagePublicId: publicId || body.imagePublicId,
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
    roles: [RoleEnum.admin],
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const data = await CompanyController.getInstance().getById(id);
        res.json(data);
      } catch (e: any) {
        responseServerError(res, e);
      }
    },
  },
  {
    path: "/:id",
    method: "patch",
    roles: [RoleEnum.admin, RoleEnum.merchant],
    middleware: upload.single("image"),
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const body: Partial<ICompany> = req.body;

        if (req.file) {
          const existing = await CompanyController.getInstance().getOne({
            query: { _id: id },
          });
          if (existing?.imagePublicId) {
            await deleteFromCloudinary(existing.imagePublicId);
          }
          const cloudRes = await uploadToCloudinary(
            req.file.buffer,
            "companies",
          );
          body.image = cloudRes.url;
          body.imagePublicId = cloudRes.publicId;
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
    roles: [RoleEnum.admin],
    handler: async (req: Request, res: Response) => {
      try {
        const id = req.params.id as string;
        const company = await CompanyController.getInstance().getOne({
          query: { _id: id },
        });
        if (company?.imagePublicId) {
          await deleteFromCloudinary(company.imagePublicId);
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
