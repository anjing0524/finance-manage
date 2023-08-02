import '../styles/globals.css';

import { cn } from '@/lib/utils';
import Providers from '@/ui/Providers';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
export const metadata = {
  title: '画布',
  description: ' paint with convas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cn(inter.className, 'overflow-y-scroll bg-gray-100 ')}>
        <Providers>{children} </Providers>
      </body>
    </html>
  );
}
