import mongoose, { Schema, Document } from 'mongoose';

interface Expense {
  description: string;
  amount: number;
  date: Date;
}

export interface ExpenseCategoryDocument extends Document {
  category: string;
  expenses: Expense[];
}

const ExpenseSchema = new Schema<Expense>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const ExpenseCategorySchema = new Schema<ExpenseCategoryDocument>({
  category: { type: String, required: true, unique: true },
  expenses: [ExpenseSchema]
});

export default mongoose.models.ExpenseCategory ||
  mongoose.model<ExpenseCategoryDocument>('ExpenseCategory', ExpenseCategorySchema);