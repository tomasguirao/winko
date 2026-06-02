import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Winko — Get rated. Stay anonymous.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
