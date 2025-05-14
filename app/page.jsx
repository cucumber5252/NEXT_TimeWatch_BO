'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/admin');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-8 bg-[#161616] rounded-md shadow-lg text-center">
                <div className="w-16 h-16 border-4 border-t-[#0077FF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-white font-medium">리디렉션 중...</p>
            </div>
        </div>
    );
}
