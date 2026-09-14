import { Router } from "express";
import { verifyGoogleToken } from "../utils/google-auth.util";
import { Response } from "express";
import { Request } from "express";
import { clientUserModel } from "../models/client-user";
import { TokenPayload } from "google-auth-library";
import jwt from "jsonwebtoken";
import "dotenv/config";
const router = Router();

router.post("/auth", async (req: Request, res: Response) => {
  const { idToken } = req.body;
  const payload = (await verifyGoogleToken(idToken)) as unknown as TokenPayload;

  let user = await clientUserModel.findOne({ email: payload.email! });
  if (!user) {
    user = await clientUserModel.create({
      email: payload.email!,
      name: payload.name!,
      google_id: payload.sub!,
      profile: payload.picture!,
    });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_KEY!, {
    expiresIn: "7d",
  });
  res.json({ token, user });
});
export const googleRoute = router;
