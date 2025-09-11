import mongoose, { Document, Schema } from 'mongoose';

export interface IProductReview extends Document {
  variantId: string;
  review: string;
  score: number;
}

const ProductReviewSchema: Schema = new Schema(
  {
    variantId: {
      type: String,
      required: true,
      ref: 'Product',
    },
    review: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Create an index for efficient querying
ProductReviewSchema.index({ variantId: 1 });
ProductReviewSchema.index({ score: -1 });

export default mongoose.model<IProductReview>('ProductReview', ProductReviewSchema);
