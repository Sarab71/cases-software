import mongoose, { Schema, Document } from 'mongoose';

export interface IBillItem {
  modelNumber: string;
  quantity: number;
  rate: number;
  discount?: number;      // discount per unit or percentage
  netAmount: number;     // after discount
  totalAmount: number;   // quantity * netAmount
}

export interface IBill extends Document {
  invoiceNumber: number;
  customerId: mongoose.Types.ObjectId;
  date: Date;
  items: IBillItem[];
  grandTotal: number;     // sum of totalAmount of all items
}

const BillItemSchema = new Schema<IBillItem>({
  modelNumber: { type: String, required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  discount: { type: Number },
  netAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true }
});

const BillSchema = new Schema<IBill>({
  invoiceNumber: { type: Number, required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  date: { type: Date, default: Date.now },
  items: { type: [BillItemSchema], required: true },
  grandTotal: { type: Number, required: true }
});

export default mongoose.models.Bill || mongoose.model<IBill>('Bill', BillSchema);
