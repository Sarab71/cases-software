import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  customerId: mongoose.Types.ObjectId;
  type: 'debit' | 'credit';
  amount: number;
  date: Date;
  description?: string;
  relatedBillId?: mongoose.Types.ObjectId;
  invoiceNumber?: number;  // <-- Added this line
}

const transactionSchema = new Schema<ITransaction>({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  type: { type: String, enum: ['debit', 'credit'], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: String,
  relatedBillId: { type: Schema.Types.ObjectId, ref: 'Bill', default: null }, // Fixed to 'Bill'
  invoiceNumber: { type: Number, default: null }  // <-- Added this field
});

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);
