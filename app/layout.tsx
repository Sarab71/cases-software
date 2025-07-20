import "./globals.css";
import Header from '@/components/Header';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="p-4">
          {children}
        </main>
        <ToastContainer position="top-right" autoClose={1500} />
      </body>
    </html>
  );
}
