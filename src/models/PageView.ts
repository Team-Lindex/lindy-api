import mongoose, { Document, Schema } from 'mongoose';

export interface IPageView extends Document {
  dayDate: Date;
  maskedCustomerId: number;
  variantId: string;
}

const PageViewSchema: Schema = new Schema(
  {
    dayDate: {
      type: Date,
      required: true,
    },
    maskedCustomerId: {
      type: Number,
      required: true,
    },
    variantId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Create a compound index for efficient querying
PageViewSchema.index({ maskedCustomerId: 1, variantId: 1 });
PageViewSchema.index({ dayDate: 1 });

export default mongoose.model<IPageView>('PageView', PageViewSchema);
