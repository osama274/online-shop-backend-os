import PlantModel from "../models/plantsModel.js";

export const getAllPlants = async () => {
  return await PlantModel.find({});
};

export const updateProduct = async (id, updateFields) => {
  return await PlantModel.findByIdAndUpdate(id, updateFields, { new: true });
};

export const deleteProduct = async (id) => {
  return await PlantModel.findByIdAndRemove(id);
};
