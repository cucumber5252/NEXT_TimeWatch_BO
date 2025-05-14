'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MappingManager from '../../components/admin/MappingManager';
import EventManager from '../../components/admin/EventManager';
import UnmappedDomainManager from '../../components/admin/UnmappedDomainManager';
import { Toaster } from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';

export default function AdminPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('events');
    const router = useRouter();
    const { data: session, status } = useSession();
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/signin');
        } else if (session.user.role !== 'admin') {
            setAccessDenied(true);
        }
        setIsLoading(false);
    }, [session, router, status]);

    const getPageTitle = () => {
        switch (activeTab) {
            case 'events':
                return '이벤트 관리';
            case 'mappings':
                return '매핑 관리';
            case 'unmapped':
                return '미매핑 도메인 관리';
            default:
                return 'TimeWatch Admin';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#000000]">
                <div className="p-8 bg-[#161616] rounded-md shadow-lg text-center w-64">
                    <div className="w-16 h-16 border-4 border-t-[#0077FF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-white font-medium text-base">로딩 중...</p>
                </div>
            </div>
        );
    }

    if (accessDenied) {
        return (
            <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4">
                <Card className="max-w-md w-full p-8 bg-[#161616] border-[#333]">
                    <div className="flex flex-col items-center py-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-20 w-20 text-red-600 mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10a3 3 0 100-6 3 3 0 000 6z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.5 21h-11a2 2 0 01-2-2V7.5a2 2 0 012-2H7l2-3h6l2 3h.5a2 2 0 012 2V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h2 className="text-2xl font-bold text-white mb-2">접근 제한</h2>
                        <p className="text-white text-center mt-4 text-lg leading-relaxed max-w-sm">
                            관리자 권한이 필요한 페이지입니다.
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="mt-8 px-8 py-3 bg-[#0077FF] text-white rounded-md hover:bg-[#0066DD] transition-all text-base font-medium"
                        >
                            홈으로 돌아가기
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#000000] text-white">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #444',
                    },
                    success: {
                        style: {
                            background: '#0c3c17',
                            border: '1px solid #0077FF',
                        },
                    },
                    error: {
                        style: {
                            background: '#471818',
                            border: '1px solid #e53e3e',
                        },
                    },
                }}
            />

            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="lg:ml-64 transition-all duration-300">
                {/* 헤더 */}
                <Header title={getPageTitle()} />

                {/* 모바일 헤더 여백 */}
                <div className="h-16 lg:hidden"></div>

                {/* 콘텐츠 영역 */}
                <main className="p-4 md:p-6 lg:p-8 max-w-[1600px]">
                    <div className="mt-2 mb-16">
                        {activeTab === 'events' ? (
                            <EventManager />
                        ) : activeTab === 'mappings' ? (
                            <MappingManager />
                        ) : activeTab === 'unmapped' ? (
                            <UnmappedDomainManager />
                        ) : null}
                    </div>
                </main>
            </div>
        </div>
    );
}
