import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ExpenseCategory from '@/models/Expense';

interface ExpenseInput {
  description: string;
  amount: number;
  date?: string;
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const { category, description, amount, date }: { category: string; description: string; amount: number; date?: string } = await req.json();

  if (!category || !description || !amount) {
    return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  }

  let cat = await ExpenseCategory.findOne({ category });

  const expenseObj: ExpenseInput = { description, amount };
  if (date) expenseObj.date = date;

  if (!cat) {
    cat = await ExpenseCategory.create({
      category,
      expenses: [expenseObj]
    });
  } else {
    cat.expenses.push(expenseObj);
    await cat.save();
  }

  return NextResponse.json(cat, { status: 201 });
}

export async function GET() {
  await dbConnect();
  try {
    const categories = await ExpenseCategory.find().lean();
    return NextResponse.json(categories, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: 'Failed to fetch expenses', error: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Failed to fetch expenses' }, { status: 500 });
  }
}
