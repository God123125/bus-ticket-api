import { NextFunction } from "express";
import { Request, Response } from "express";
import { responseServerError } from "../utils/log.util";
import jwt from "jsonwebtoken";
import { userModel } from "../models/users";
import { HttpResponseCode } from "../interfaces/http-response-enum";
export default class AuthHandlers {
  public static requiredAuth(req: Request, res: Response, next: NextFunction) {
    req.requiredAuth = true;
    return next();
  }

  public static notRequiredAuth(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    req.requiredAuth = false;
    return next();
  }
  public static async authentication(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (!req.requiredAuth) {
      return next();
    }
    const authHeader = req.header("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "unauthenticated" });
    }
    const secret = process.env.JWT_KEY;
    if (!secret) {
      return res.status(500).json({ message: "Server auth misconfigured" });
    }
    try {
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
      req.user = decoded.user;
      req.company = decoded.company || "";
      next();
    } catch (e: any) {
      responseServerError(res, e);
    }
  }
  public static required_company(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    req.requiredCompany = true;
    return next();
  }
  public static roleHandler(role: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const user = await userModel.findById(req.body).select("role").lean();
      if (!user) {
        return res.status(HttpResponseCode.client_error).json({
          msg: "User not found",
        });
      }
      if (user.role !== role) {
        return res.status(HttpResponseCode.forbidden).json({
          msg: "Forbidden",
        });
      }
    };
  }
}
