import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  amount: number;
  date: Date;
  description?: string;
}

const expenseSchema = new Schema<IExpense>({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  description: String
});

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', expenseSchema);
