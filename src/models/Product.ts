import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  variantId: string;
  productLink: string;
  productImageLink: string;
  modelImageLink: string;
  productDescSE: string;
  productDescEN: string;
}

const ProductSchema: Schema = new Schema(
  {
    variantId: {
      type: String,
      required: true,
      unique: true,
    },
    productLink: {
      type: String,
      required: true,
    },
    productImageLink: {
      type: String,
      required: true,
    },
    modelImageLink: {
      type: String,
      required: true,
    },
    productDescSE: {
      type: String,
      required: true,
    },
    productDescEN: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>('Product', ProductSchema);
