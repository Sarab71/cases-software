import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const filter: Record<string, unknown> = { type: 'debit' }; // Only debit transactions

        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const transactions = await Transaction.find(filter);

        const totalSales = transactions.reduce(
            (sum: number, txn: { amount?: number }) => sum + (txn.amount || 0),
            0
        );

        return NextResponse.json({ totalSales });
    } catch (error: unknown) {
        console.error('Error fetching total sales:', error);
        if (error instanceof Error) {
            return NextResponse.json(
                { message: 'Internal server error', error: error.message },
                { status: 500 }
            );
        }
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
