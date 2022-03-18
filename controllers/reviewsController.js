import reviewModel from "../models/reviewModel.js";

export const getAllReviews = async () => {
  return await reviewModel.find({});
};
