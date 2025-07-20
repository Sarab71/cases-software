// utils/pdfTemplate.ts
export const generateInvoiceHtml = (data: any) => {
    const { invoiceNumber, customer, items, grandTotal, date } = data;
    const roundedGrandTotal = Math.round(data.grandTotal);

    const rows = items.map((item: any, idx: number) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${item.modelNumber}</td>
      <td>${item.quantity}</td>
      <td>${item.rate}</td>
      <td>${item.discount}%</td>
      <td>₹${item.totalAmount}</td>
    </tr>
  `).join('');

    return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          .total { font-size: 16px; margin-top: 20px; text-align: right; }
        </style>
      </head>
      <body>
        <h1>INVOICE</h1>
        <p>Invoice Number: ${invoiceNumber}</p>
        <p>Date: ${date}</p>
        <p>Customer Name: ${customer.name}</p>
        <p>Address: ${customer.address}</p>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Model No.</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Discount</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

       <p class="total"><strong>Grand Total: ₹${roundedGrandTotal}</strong></p>

      </body>
    </html>
  `;
};
