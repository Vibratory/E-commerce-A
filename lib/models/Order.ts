import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customerClerkId: String,
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      color: String,
      size: String,
      quantity: Number,
    },
  ],

  shippingAddress: {
    name: String,
    number: String,
    email: String,
    city: String,
    state: String,
    zip: String,
    
  },

  shippingRate: String,
  totalAmount: Number,
  status : String,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
