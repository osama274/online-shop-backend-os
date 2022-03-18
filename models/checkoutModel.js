import mongoose from "mongoose";

const CheckoutSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    state: { type: String, required: true },
    phone: { type: Number, required: true },
    city: { type: String, required: true },
    zipcode: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    items: { type: Object, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "checkout",
  }
);

const CheckoutModel = mongoose.model("checkout", CheckoutSchema);

export default CheckoutModel;
