import { companyModel, ICompany } from "../models/company";
import { Controller } from "./controller";
export default class CompanyController extends Controller<ICompany> {
  private static instance: CompanyController;
  private constructor() {
    super(companyModel);
  }
  public static getInstance(): CompanyController {
    if (!CompanyController.instance) {
      CompanyController.instance = new CompanyController();
    }
    return CompanyController.instance;
  }
}
