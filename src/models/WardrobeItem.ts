import mongoose, { Document, Schema } from 'mongoose';

export interface IWardrobeItem extends Document {
  userId: number;
  imageUrl: string;
  type: string;
  tags: string[];
}

const WardrobeItemSchema: Schema = new Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      // Accept any string for type
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Create compound index for efficient querying
WardrobeItemSchema.index({ userId: 1, type: 1 });

export default mongoose.model<IWardrobeItem>('WardrobeItem', WardrobeItemSchema);
