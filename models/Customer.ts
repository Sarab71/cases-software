import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  address: string;
  balance?: number;
  createdAt: Date;
}

const customerSchema = new Schema<ICustomer>({
  name: { type: String, required: true, unique: true, trim: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  balance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);
