import { IRoute } from "../interfaces/route";
import { parseToExpressRoute } from "../utils/route.util";
import { upload } from "../config/cloudinary";
import { userController } from "../controllers/users.controller";
import { RoleEnum } from "../interfaces/role-enum";

const routes: IRoute[] = [
  {
    path: "/login",
    method: "post",
    authentication: false,
    handler: userController.login,
  },
  {
    path: "/",
    method: "get",
    roles: [RoleEnum.Admin, RoleEnum.Merchant],
    handler: userController.getMany,
  },
  {
    path: "/",
    method: "post",
    middleware: upload.single("profile"),
    roles: [RoleEnum.Admin, RoleEnum.Merchant, RoleEnum.Staff],
    handler: userController.create,
  },
  {
    path: "/:id",
    method: "patch",
    middleware: upload.single("profile"),
    roles: [RoleEnum.Admin, RoleEnum.Merchant, RoleEnum.Staff],
    handler: userController.update,
  },
  {
    path: "/:id",
    method: "delete",
    roles: [RoleEnum.Admin, RoleEnum.Merchant],
    handler: userController.delete,
  },
  {
    path: "/:id",
    method: "get",
    roles: [RoleEnum.Admin, RoleEnum.Merchant, RoleEnum.Staff],
    handler: userController.getById,
  },
];

export const userRoute = parseToExpressRoute(routes);
