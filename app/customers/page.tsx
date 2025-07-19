'use client';

import { useState } from 'react';
import CustomerSideBar from '@/components/CustomerSideBar';
import CustomerStatement from '@/components/CustomerStatement';

export default function CustomersPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');

  const handleSelectCustomer = (customerId: string, customerName: string) => {
    setSelectedCustomerId(customerId);
    setSelectedCustomerName(customerName);
  };

  return (
    <div className="flex">
      <CustomerSideBar onSelectCustomer={handleSelectCustomer} />

      <div className="flex-1 p-4 ml-64"> {/* ml-64 to push content beside fixed sidebar */}
        <h1 className="text-2xl font-bold mb-4">Customer Details</h1>

        {selectedCustomerId ? (
          <CustomerStatement
            customerId={selectedCustomerId}
            customerName={selectedCustomerName}
          />
        ) : (
          <p>Select a customer from the sidebar to view their statement.</p>
        )}
      </div>
    </div>
  );
}
