import mongoose, { Document, Schema } from 'mongoose';

export interface IStyleDescription extends Document {
  style: string;
  styleDescription: string;
  styleKeywords: string[];
}

const StyleDescriptionSchema: Schema = new Schema(
  {
    style: {
      type: String,
      required: true,
      unique: true,
    },
    styleDescription: {
      type: String,
      required: true,
    },
    styleKeywords: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IStyleDescription>('StyleDescription', StyleDescriptionSchema);
