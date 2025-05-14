'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const menuItems = [
        {
            id: 'events',
            name: '이벤트 관리',
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                </svg>
            ),
        },
        {
            id: 'mappings',
            name: '매핑 관리',
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                    />
                </svg>
            ),
        },
        {
            id: 'unmapped',
            name: '미매핑 도메인',
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                </svg>
            ),
        },
    ];

    return (
        <>
            {/* 모바일 햄버거 메뉴 */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#161616] border-b border-[#292929] z-50 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-white focus:outline-none"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                />
                            </svg>
                        </button>
                        <span className="ml-4 text-white font-semibold">TimeWatch Admin</span>
                    </div>

                    {/* 모바일 유저 정보 */}
                    {session && (
                        <div className="flex items-center">
                            <span className="text-sm text-white mr-2">{session.user.name || session.user.email}</span>
                            <button
                                onClick={() => signOut({ callbackUrl: '/signin' })}
                                className="text-white hover:text-[#0077FF]"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 모바일 사이드바 메뉴 (오버레이) */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div
                        className="fixed top-0 left-0 bottom-0 w-64 bg-[#161616] shadow-xl z-50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-[#292929]">
                            <div className="flex items-center">
                                <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M12 4L7 9H17L12 4Z" fill="#0077FF" />
                                    <path d="M17 15H7L12 20L17 15Z" fill="#0077FF" />
                                    <rect x="7" y="11" width="10" height="2" fill="#0077FF" />
                                </svg>
                                <h1 className="ml-2 text-lg font-bold text-white">TimeWatch Admin</h1>
                            </div>
                        </div>
                        <div className="px-2 py-4">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`flex items-center w-full px-4 py-3 rounded-md mb-1 transition-all duration-200 ${
                                        activeTab === item.id
                                            ? 'bg-[#0077FF] bg-opacity-20 text-[#0077FF]'
                                            : 'text-[#999] hover:bg-[#222] hover:text-white'
                                    }`}
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    <span className="font-medium text-sm">{item.name}</span>
                                </button>
                            ))}
                        </div>
                        {session && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#292929]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-[#0077FF] flex items-center justify-center text-black font-semibold">
                                            {session.user.name?.[0] || session.user.email?.[0] || '?'}
                                        </div>
                                        <div className="ml-2">
                                            <p className="text-sm text-white font-medium truncate max-w-[120px]">
                                                {session.user.name || session.user.email}
                                            </p>
                                            <p className="text-xs text-[#666]">관리자</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/signin' })}
                                        className="text-[#999] hover:text-white"
                                        title="로그아웃"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 데스크탑 사이드바 */}
            <div
                className={`hidden lg:block fixed top-0 left-0 bottom-0 bg-[#161616] border-r border-[#292929] transition-all duration-300 z-30 ${
                    isCollapsed ? 'w-20' : 'w-64'
                }`}
            >
                <div className="p-4 flex items-center justify-between border-b border-[#292929]">
                    <div className="flex items-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4L7 9H17L12 4Z" fill="#0077FF" />
                            <path d="M17 15H7L12 20L17 15Z" fill="#0077FF" />
                            <rect x="7" y="11" width="10" height="2" fill="#0077FF" />
                        </svg>
                        {!isCollapsed && <h1 className="ml-2 text-lg font-bold text-white">TimeWatch Admin</h1>}
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="text-[#999] hover:text-white transition-colors duration-200"
                        title={isCollapsed ? '사이드바 확장' : '사이드바 축소'}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
                            />
                        </svg>
                    </button>
                </div>

                <div className="p-2 mt-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center w-full px-4 py-3 rounded-md mb-1 transition-all duration-200 ${
                                activeTab === item.id
                                    ? 'bg-[#0077FF] bg-opacity-20 text-[#0077FF]'
                                    : 'text-[#999] hover:bg-[#222] hover:text-white'
                            }`}
                            title={isCollapsed ? item.name : ''}
                        >
                            <span className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`}>{item.icon}</span>
                            {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                        </button>
                    ))}
                </div>

                {session && !isCollapsed && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#292929]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-[#0077FF] flex items-center justify-center text-black font-semibold">
                                    {session.user.name?.[0] || session.user.email?.[0] || '?'}
                                </div>
                                <div className="ml-2">
                                    <p className="text-sm text-white font-medium truncate max-w-[120px]">
                                        {session.user.name || session.user.email}
                                    </p>
                                    <p className="text-xs text-[#666]">관리자</p>
                                </div>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/signin' })}
                                className="text-[#999] hover:text-white"
                                title="로그아웃"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {session && isCollapsed && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#292929]">
                        <div className="flex justify-center">
                            <button
                                onClick={() => signOut({ callbackUrl: '/signin' })}
                                className="text-[#999] hover:text-white"
                                title="로그아웃"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Sidebar;
