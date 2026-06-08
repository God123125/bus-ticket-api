import "dotenv/config";
import jwt from "jsonwebtoken";
export const getToken = (data?: { user: string; company: string }) => {
  const secret = process.env.JWT_KEY;
  if (!secret) {
    throw new Error("JWT_KEY is not defined in environment variables.");
  }
  return jwt.sign({ user: data?.user, company: data?.company }, secret, {
    expiresIn: "24h",
  });
};
export const getExpirationDate = (token: string): Date | null => {
  const decoded = jwt.decode(token) as { exp?: number };
  if (!decoded?.exp) return null;

  // Convert Unix timestamp to JavaScript Date
  return new Date(decoded.exp * 1000);
};
