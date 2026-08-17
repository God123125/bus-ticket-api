import { Request, Response } from "express";
import { IUser, userModel } from "../models/users";
import { deleteFromCloudinary, uploadToCloudinary } from "../config/cloudinary";
import * as bcrypt from "bcrypt";
import { responseServerError } from "../utils/log.util";
import { getToken, getExpirationDate } from "../auth/auth.service";
import { RoleEnum } from "../interfaces/role-enum";
export const userController = {
  getMany: async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = (req.query.search as string) || "";
      const skip = (page - 1) * limit;
      let query: any = { role: { $ne: RoleEnum.Admin } };
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: "i" } },
          { full_name: { $regex: search, $options: "i" } },
        ];
      }
      if (req.company) {
        query.company = req.company;
        query.role = {
          $or: [{ $ne: RoleEnum.Merchant }, { $ne: RoleEnum.Admin }],
        };
      }
      const users = await userModel
        .find(query)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .select(["-profilePublicId", "-password"]);
      res.json({
        list: users,
        total: await userModel.countDocuments({
          role: { $ne: RoleEnum.Admin },
        }),
      });
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  getById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const users = await userModel
        .findById(id)
        .select(["-profilePublicId", "-password"]);
      res.json(users);
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  create: async (req: Request, res: Response) => {
    try {
      let url = "";
      let publicId = "";
      if (req.file) {
        const cloudRes = await uploadToCloudinary(req.file!.buffer, "profiles");
        url = cloudRes.url;
        publicId = cloudRes.publicId;
      }
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(req.body.password, salt);
      const user: IUser = {
        full_name: req.body.full_name ?? "",
        username: req.body.username,
        password: hash,
        profile: url ?? "",
        profilePublicId: publicId ?? "",
        role: req.body.role ?? RoleEnum.Merchant,
        tel: req.body.tel ?? "",
        address: req.body.address ?? "",
        bank_acc_number: req.body.bank_acc_number ?? "",
        bank_acc_name: req.body.bank_acc_name ?? "",
        company: req.company ?? "",
      };
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
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(req.body.password, salt);
      }
      user.username = req.body.username ?? user.username;
      user.full_name = req.body.full_name;
      user.tel = req.body.tel;
      user.address = req.body.address;
      user.bank_acc_number = req.body.bank_acc_number;
      user.bank_acc_name = req.body.bank_acc_name;
      user.company = req.body.company;
      await user.save();
      res.status(200).json(user);
    } catch (e: any) {
      responseServerError(res, e);
    }
  },
  delete: async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const user = await userModel.findById(id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.profilePublicId) {
        await deleteFromCloudinary(user.profilePublicId);
      }
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
      const compare = await bcrypt.compare(password, user.password);
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
