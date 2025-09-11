import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
  dayDate: Date;
  maskedCustomerId: number;
  variantId: string;
}

const FavoriteSchema: Schema = new Schema(
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

export default mongoose.model<IFavorite>('Favorite', FavoriteSchema);
