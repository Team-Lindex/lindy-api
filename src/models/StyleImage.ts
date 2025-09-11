import mongoose, { Document, Schema } from 'mongoose';

export interface IStyleImage extends Document {
  style: string;
  images: string[];
}

const StyleImageSchema: Schema = new Schema(
  {
    style: {
      type: String,
      required: true,
      unique: true,
      ref: 'StyleDescription',
    },
    images: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

// Create an index for efficient querying
StyleImageSchema.index({ style: 1 });

export default mongoose.model<IStyleImage>('StyleImage', StyleImageSchema);
