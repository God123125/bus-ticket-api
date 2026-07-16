import { Handler, Router } from "express";
import { IRoute } from "../interfaces/route";
import AuthHandlers from "../middleware/auth-handler";
export const parseToExpressRoute = (
  routes: IRoute[],
  router?: Router,
): Router => {
  if (!router) {
    router = Router();
  }
  for (const route of routes) {
    const { path, method, role, authentication, required_company, handler } =
      route;
    let middleware: Handler[] = [];
    if (authentication) {
      middleware.push(AuthHandlers.requiredAuth);
    } else if (authentication === false) {
      middleware.push(AuthHandlers.notRequiredAuth);
    }

    if (required_company) {
      middleware.push(AuthHandlers.required_company);
    }

    middleware.push(AuthHandlers.authentication);

    if (role) {
      middleware.push(AuthHandlers.roleHandler(role));
    }

    middleware.push(handler);
    router.route(path)[method](middleware);
  }
  return router;
};
