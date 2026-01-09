import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'RecapShow Admin',
  description: 'Dashboard amministrativa per RecapShow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="bg-dark-background text-dark-text">
        {children}
      </body>
    </html>
  );
}

