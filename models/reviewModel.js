import mongoose from "mongoose";
import UserModel from "./UserModel.js";

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    review: { type: String },
    date: { type: Date, default: Date.now() },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstName lastName photo ",
    model: UserModel,
  });
  next();
});

const reviewModel = mongoose.model("Review", reviewSchema);
export default reviewModel;
