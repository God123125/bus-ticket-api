import { Handler } from "express";
import { RoleEnum } from "./role-enum";

export interface IRoute {
  path: string;
  method: "get" | "post" | "patch" | "delete";
  roles?: RoleEnum[];
  authentication?: boolean;
  required_company?: boolean;
  middleware?: Handler | Handler[];
  handler: Handler;
}
