import './globals.css';
import React from 'react';
import Nav from '../components/Nav';
import { TRPCProvider } from '../components/TRPCProvider';

export const metadata = {
  title: 'Blog Website',
  description: 'Multi-user blogging platform sample'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <TRPCProvider>
            <Nav />
            <main className="max-w-5xl mx-auto p-6">{children}</main>
          </TRPCProvider>
        </div>
      </body>
    </html>
  );
}
