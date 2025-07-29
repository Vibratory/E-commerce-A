import mongoose from "mongoose";
import { string } from "zod";

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  media: [String],
  category: String,
  collections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collection" }],
  stock: String,
  tags: [String],
  colorVariants: [
    {
      name: String,
      sizes: [
        {
          name: String,
          quantity: Number
        }
      ]
    }
  ],
  sizes: [String],
  colors: [String],
  price: { type: mongoose.Schema.Types.Decimal128, get: (v: mongoose.Schema.Types.Decimal128) => { return parseFloat(v.toString()) } },

  hidden: Boolean,
  solde: Boolean,
  newprice: Number,
  brand: String,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { toJSON: { getters: true } });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;