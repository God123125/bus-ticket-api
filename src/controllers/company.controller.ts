import { Request, Response } from "express";
import { companyModel, ICompany } from "../models/company";
import { responseServerError } from "../utils/log.util";
export const companyController = {
  getMany: async (req: Request, res: Response) => {
    try {
      const companies = await companyModel.find();
      res.json({ list: companies });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      const body: ICompany = req.body;
      const data = await companyModel.create(body);
      res.json({ msg: "Company created successfully!", data: data });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  update: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const body: Partial<ICompany> = req.body;
      await companyModel.findByIdAndUpdate(id, body);
      res.json({ msg: "Company updated successfully!" });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await companyModel.findByIdAndDelete(id);
      res.json({ msg: "Company deleted successfully!" });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
};
