import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Expense from '@/models/Expense';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  // Case-insensitive search for category starting with input
  const categories = await Expense.find(
    { category: { $regex: `^${search}`, $options: 'i' } },
    { category: 1 }
  ).limit(10);

  return NextResponse.json(categories);
}