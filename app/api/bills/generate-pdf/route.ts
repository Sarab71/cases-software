import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { generateInvoiceHtml } from '@/utils/pdfTemplate';

export async function POST(req: NextRequest) {
  const data = await req.json();

  const htmlContent = generateInvoiceHtml(data);

const browser = await puppeteer.launch({
  headless: true,  // 'new' ki jagah true ya false
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});


  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({ format: 'A4' });

  await browser.close();

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Invoice_${data.invoiceNumber}.pdf`,
    },
  });
}
