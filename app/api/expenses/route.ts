import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ExpenseCategory from '@/models/Expense';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { category, description, amount, date } = await req.json();

  if (!category || !description || !amount) {
    return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  }

  // Try to find the category
  let cat = await ExpenseCategory.findOne({ category });

  const expenseObj: any = { description, amount };
  if (date) expenseObj.date = new Date(date);

  if (!cat) {
    // Create new category with first expense
    cat = await ExpenseCategory.create({
      category,
      expenses: [expenseObj]
    });
  } else {
    // Add expense to existing category
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
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to fetch expenses', error: error.message }, { status: 500 });
  }
}