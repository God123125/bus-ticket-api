import { Request, Response } from "express";
import { IUser, userModel } from "../models/users";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary";
import bcrpyt from "bcrypt";
import { responseServerError } from "../utils/log.util";
import { getToken, getExpirationDate } from "../auth/auth.service";
export const userController = {
  getMany: async (req: Request, res: Response) => {
    try {
      const users = await userModel.find().select("-profilePublicId");
      res.json({
        list: users,
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  getById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const users = await userModel.findById(id).select("-profilePublicId");
      res.json(users);
    } catch (e: any) {
      responseServerError(res, e);
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
      const user: IUser = {
        username: req.body.username,
        password: hash,
        profile: url,
        profilePublicId: publicId,
        role: req.body.role,
      };
      if (req.body.company) {
        user.company = req.body.company;
        user.tel = req.body.tel || "";
        user.addresss = req.body.address || "";
      }
      await userModel.create(user);
      res.status(201).json(user);
    } catch (e: any) {
      responseServerError(res, e);
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
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      await userModel.findByIdAndDelete(id);
      res.json({
        msg: "User deleted successfully",
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await userModel.findOne({ username: username });
      if (!user) return res.status(400).json({ msg: "User not found" });
      const compare = await bcrpyt.compare(password, user.password);
      if (!compare) return res.status(400).json({ msg: "Wrong password" });
      const data = {
        user: user._id,
        company: user.company,
      };
      const token = getToken(data as any);
      const expireAt = getExpirationDate(token);
      const userResponse = {
        username: user.username,
        role: user.role,
      };
      res.json({
        user: userResponse,
        token,
        expireAt,
        msg: "Login success",
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
};
