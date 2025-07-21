import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const filter: Record<string, any> = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);  // ✅ include full endDate day

            filter.updatedAt = {
                $gte: start,
                $lt: end,  // ✅ use $lt instead of $lte
            };
        }

        const customers = await Customer.find(filter);

        const totalOutstanding = customers.reduce(
            (sum, customer) => sum + (customer.balance || 0),
            0
        );

        return NextResponse.json({ totalOutstanding });
    } catch (error: unknown) {
        console.error('Error calculating outstanding:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
