import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { responseServeError } from "../utils/log.util";
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
    responseServeError(res, e);
  }
};
