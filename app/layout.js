'use client';

import { SessionProvider } from 'next-auth/react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
    return (
        <html lang="ko">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="TimeWatch 관리자 페이지" />
                <title>TimeWatch Admin</title>
            </head>
            <body className={`${inter.className} bg-[#000000] text-white`}>
                <SessionProvider>
                    {children}
                    <Analytics />
                </SessionProvider>
            </body>
        </html>
    );
}
