import { type User, type InsertUser } from "@shared/schema";
import UserModel from "../../models/User";
import { BaseStorage } from "../base/BaseStorage";
import { DataTransformer } from "../base/DataTransformer";

export class UserRepository extends BaseStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      await this.ensureConnection();
      const user = await UserModel.findById(id);
      if (!user) return undefined;
      
      return DataTransformer.transformUser(user);
    } catch (error) {
      this.handleError("getting user", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      await this.ensureConnection();
      const user = await UserModel.findOne({ username });
      if (!user) return undefined;
      
      return DataTransformer.transformUser(user);
    } catch (error) {
      this.handleError("getting user by username", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      await this.ensureConnection();
      const user = await UserModel.findOne({ email });
      if (!user) return undefined;
      
      return DataTransformer.transformUser(user);
    } catch (error) {
      this.handleError("getting user by email", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser & { verificationToken?: string; verificationTokenExpires?: Date }): Promise<User> {
    try {
      await this.ensureConnection();
      const user = new UserModel(insertUser);
      const savedUser = await user.save();
      
      return DataTransformer.transformUser(savedUser);
    } catch (error) {
      this.handleError("creating user", error);
      throw error;
    }
  }

  async findUserByVerificationToken(token: string): Promise<User | undefined> {
    try {
      await this.ensureConnection();
      const user = await UserModel.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() },
      });
      if (!user) return undefined;
      
      return DataTransformer.transformUser(user);
    } catch (error) {
      this.handleError("finding user by verification token", error);
      return undefined;
    }
  }

  async verifyUser(userId: string): Promise<void> {
    try {
      await this.ensureConnection();
      await UserModel.findByIdAndUpdate(userId, {
        isVerified: true,
        verificationToken: undefined,
        verificationTokenExpires: undefined,
      });
    } catch (error) {
      this.handleError("verifying user", error);
    }
  }
}