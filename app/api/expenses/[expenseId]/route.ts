import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ExpenseCategory from '@/models/Expense';
import mongoose from 'mongoose';

export async function DELETE(req: NextRequest, { params }: { params: { expenseId: string } }) {
    await dbConnect();

    try {
        const expenseId = params.expenseId;

        // Find the category that contains this expense
        const category = await ExpenseCategory.findOne({ 'expenses._id': expenseId });
        if (!category) {
            return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
        }

        // Remove the expense from the category
        category.expenses = category.expenses.filter(
            (exp: { _id: mongoose.Types.ObjectId }) => exp._id.toString() !== expenseId
        );
        await category.save();

        return NextResponse.json({ message: 'Expense deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting expense:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
