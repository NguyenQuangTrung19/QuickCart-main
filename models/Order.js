import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "User" },
  items: [
    {
      products: { type: String, required: true, ref: "Product" },
      quantity: { type: Number, required: true },
    },
  ],
  amount: { type: String, required: true },
  address: { type: String, ref: "Address", required: true },
  status: { type: String, required: true, default: "Order Placed" },
  date: { type: Number, required: true },
});

const Order = mongoose.models.order || mongoose.model("order", orderSchema);

export default Order;
