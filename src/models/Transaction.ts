import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  dayDate: Date;
  maskedCustomerId: number;
  variantId: string;
  businessAreaName: string;
  productGroupName: string;
  styleName: string;
  colourGroup: string;
  sizeDesc: string;
}

const TransactionSchema: Schema = new Schema(
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
    businessAreaName: {
      type: String,
      required: true,
    },
    productGroupName: {
      type: String,
      required: true,
    },
    styleName: {
      type: String,
      required: true,
    },
    colourGroup: {
      type: String,
      required: true,
    },
    sizeDesc: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
