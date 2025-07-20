import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const filter: Record<string, unknown> = {};
        if (startDate && endDate) {
            filter.updatedAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const customers = await Customer.find(filter);

        const totalOutstanding = customers.reduce((sum: number, c: { balance?: number }) => sum + (c.balance || 0), 0);

        return NextResponse.json({ totalOutstanding });
    } catch (error: unknown) {
        console.error('Error calculating outstanding:', error);
        if (error instanceof Error) {
            return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
        }
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
