import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Brandavox AI — All-in-one Creative & Marketing OS',
  description: 'Clean and simple workspace for social media managers, digital marketers, brand creators, and advertising teams.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark antialiased">
      <body className="min-h-full flex flex-col bg-background text-text-primary">
        {children}
      </body>
    </html>
  );
}
