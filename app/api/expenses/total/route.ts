import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ExpenseCategory from '@/models/Expense';

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (end) end.setDate(end.getDate() + 1); // Include end date fully

        const categories = await ExpenseCategory.find();

        let totalExpenses = 0;
        categories.forEach(category => {
            category.expenses.forEach((expense: any) => {
                const expenseDate = new Date(expense.date);
                if (
                    (!start || expenseDate >= start) &&
                    (!end || expenseDate < end)
                ) {
                    totalExpenses += expense.amount || 0;
                }
            });
        });

        return NextResponse.json({ totalExpenses });
    } catch (error: any) {
        console.error('Error calculating total expenses:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}
