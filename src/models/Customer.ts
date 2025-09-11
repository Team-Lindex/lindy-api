import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  customerId: number;
  firstName: string;
  lastName: string;
}

const CustomerSchema: Schema = new Schema(
  {
    customerId: {
      type: Number,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
