import mongoose from "mongoose";

const PlantsSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  image_small: { type: String, required: true },
  price: { type: Number, required: true },
  light: { type: String, required: true },
  winterHardness: { type: String, required: true },
  nutrientRequirements: { type: String, required: true },
  growthHeight: { type: String, required: true },
  soilMoisture: { type: String, required: true },
  description: { type: String, required: true },
  abstract: { type: String, required: true },
  location:{ type: String, required: true },
  imageGallery:[String]
});
const PlantModel = mongoose.model("plant", PlantsSchema);
export default PlantModel;
