import bcrypt from "bcrypt";
import { userModel } from "../models/users";
import { RoleEnum } from "../interfaces/role-enum";

export async function seedAdminUser() {
  try {
    const adminExists = await userModel.findOne({ username: "admin" });

    if (!adminExists) {
      console.log("Admin account not found. Creating default admin...");

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("12345678", salt);

      await userModel.create({
        full_name: "Super Admin",
        username: "admin",
        password: hashedPassword,
        role: RoleEnum.Admin,
      });

      console.log("Default admin account created: admin / 12345678");
    }
  } catch (error) {
    console.error("Failed to seed admin user:", error);
  }
}
