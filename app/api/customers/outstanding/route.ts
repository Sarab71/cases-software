import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function GET(req: NextRequest) {
    await dbConnect();

    try {
        const { searchParams } = new URL(req.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const filter: any = {};
        if (startDate && endDate) {
            filter.updatedAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const customers = await Customer.find(filter);

        const totalOutstanding = customers.reduce((sum, c) => sum + (c.balance || 0), 0);

        return NextResponse.json({ totalOutstanding });
    } catch (error: any) {
        console.error('Error calculating outstanding:', error);
        return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
    }
}
