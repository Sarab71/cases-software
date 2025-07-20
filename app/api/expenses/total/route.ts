import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ExpenseCategory from '@/models/Expense';

interface Expense {
    amount: number;
    date: string;
}

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const categories = await ExpenseCategory.find();

        let totalExpenses = 0;
        categories.forEach(category => {
            category.expenses.forEach((expense: Expense) => {
                const expenseDate = new Date(expense.date);
                if (
                    (!startDate || expenseDate >= new Date(startDate)) &&
                    (!endDate || expenseDate <= new Date(endDate))
                ) {
                    totalExpenses += expense.amount || 0;
                }
            });
        });

        return NextResponse.json({ totalExpenses });
    } catch (error) {
        console.error('Error calculating total expenses:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
