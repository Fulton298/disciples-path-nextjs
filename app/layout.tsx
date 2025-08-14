import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: "Disciple's Path",
  description: 'Growth in virtue and daily fidelity — by grace.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
