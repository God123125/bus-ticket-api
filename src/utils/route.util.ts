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
    const {
      path,
      method,
      roles,
      authentication,
      required_company,
      middleware: customMiddleware,
      handler,
    } = route;
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

    if (roles) {
      middleware.push(AuthHandlers.roleHandler(roles));
    }

    if (customMiddleware) {
      if (Array.isArray(customMiddleware)) {
        middleware.push(...customMiddleware);
      } else {
        middleware.push(customMiddleware);
      }
    }

    middleware.push(handler);
    router.route(path)[method](middleware);
  }
  return router;
};
