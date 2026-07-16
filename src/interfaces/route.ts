import { Handler } from "express";
import { RoleEnum } from "./role-enum";

export interface IRoute {
  path: string;
  method: "get" | "post" | "patch" | "delete";
  role?: RoleEnum;
  authentication?: boolean;
  required_company?: boolean;
  handler: Handler;
}
