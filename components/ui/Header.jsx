'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

const Header = ({ title }) => {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className="hidden lg:flex items-center justify-between bg-[#161616] border-b border-[#292929] px-6 py-4 mb-6">
            <h1 className="text-xl font-bold text-white flex items-center">
                {title}
                <div className="w-2 h-2 rounded-full bg-[#0077FF] ml-2 animate-pulse"></div>
            </h1>

            {session && (
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center space-x-2 focus:outline-none"
                    >
                        <div className="w-9 h-9 rounded-full bg-[#0077FF] flex items-center justify-center text-black font-semibold text-sm">
                            {session.user.name?.[0] || session.user.email?.[0] || '?'}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-white font-medium">{session.user.name || session.user.email}</p>
                            <p className="text-xs text-[#999]">관리자</p>
                        </div>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className={`w-5 h-5 text-[#999] transition-transform duration-200 ${
                                dropdownOpen ? 'rotate-180' : ''
                            }`}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#202020] border border-[#333] rounded-md shadow-lg z-50">
                            <div className="p-3 border-b border-[#333]">
                                <p className="text-sm text-white font-medium truncate">{session.user.email}</p>
                                <p className="text-xs text-[#999] mt-1">관리자 계정</p>
                            </div>
                            <div className="p-2">
                                <button
                                    onClick={() => signOut({ callbackUrl: '/signin' })}
                                    className="flex items-center w-full px-3 py-2 text-sm text-white hover:bg-[#333] rounded-md transition-colors duration-200"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-4 h-4 mr-2 text-[#999]"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                                        />
                                    </svg>
                                    로그아웃
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Header;
