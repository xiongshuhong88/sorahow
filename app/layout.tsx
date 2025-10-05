import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Sorahow Knowledge Base',
  description: 'Bilingual knowledge hub for tutorials, resources, and news.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="app-body">
        <main className="app-container">{children}</main>
      </body>
    </html>
  );
}
