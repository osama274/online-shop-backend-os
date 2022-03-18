import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    plantName: { type: String, required: true },
    star: { type: Number, required: true },
    customer: { type: String, required: true },
    message: { type: String, required: true },
    plantId: { type: String, required: true },
    
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "ratings",
  }
);

const ratingModel = mongoose.model("rating", ratingSchema);

export default ratingModel;
