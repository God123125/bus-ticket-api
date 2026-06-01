import { Request, Response } from "express";
import { IUser, userModel } from "../models/users";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary";
import bcrpyt from "bcrypt";
export const userController = {
  getMany: async (req: Request, res: Response) => {
    try {
      const users = await userModel.find();
      res.json(users);
    } catch (e) {
      console.log(e);
    }
  },
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
  update: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const user = await userModel.findById(id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (req.file) {
        if (user.profilePublicId) {
          await deleteFromCloudinary(user.profilePublicId);
        }
        const { url, publicId } = await uploadToCloudinary(
          req.file.buffer,
          "profiles",
        );
        user.profile = url;
        user.profilePublicId = publicId;
      }
      if (req.body.password) {
        const salt = await bcrpyt.genSalt();
        user.password = await bcrpyt.hash(req.body.password, salt);
      }
      user.username = req.body.username ?? user.username;
      await user.save();
      res.status(200).json(user);
    } catch (e) {
      console.log(e);
    }
  },
};
