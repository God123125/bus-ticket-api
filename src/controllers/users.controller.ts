import { Request, Response } from "express";
import { IUser, userModel } from "../models/users";
import { uploadToCloudinary } from "../config/cloudinary";
import bcrpyt from "bcrypt";
export const userController = {
  create: async (req: Request, res: Response) => {
    try {
      const { url, publicId } = await uploadToCloudinary(
        req.file!.buffer,
        "profiles",
      );
      const salt = await bcrpyt.genSalt();
      const hash = await bcrpyt.hash(req.body.password, salt);
      const user = {
        username: req.body.username,
        password: hash,
        profile: url,
        profilePublicId: publicId,
      };
      await userModel.create(user);
      res.status(201).json(user);
    } catch (e) {
      console.log(e);
    }
  },
};
