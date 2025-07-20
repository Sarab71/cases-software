import TotalOutstanding from '@/components/TotalOutstanding';
import PaymentsReceived from '@/components/PaymentsReceived';
import TotalSales from '@/components/TotalSales';

export default function Home() {
  return (
    <>
      <h1 className="text-center text-2xl font-bold mb-2">Welcome to the Billing System</h1>
      <p className="text-center mb-8">Manage your bills and payments efficiently.</p>
      <div className="flex flex-col md:flex-row justify-center items-center gap-6">
        <TotalOutstanding />
        <PaymentsReceived />
        <TotalSales />
      </div>
    </>
  );
}