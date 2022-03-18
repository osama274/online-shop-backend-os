import UserModel from "../models/UserModel.js";

export const getAllUsers = async () => {
  return await UserModel.find({});
};
