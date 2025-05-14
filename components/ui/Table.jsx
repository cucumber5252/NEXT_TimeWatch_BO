'use client';

import React from 'react';

// 테이블 컴포넌트
export const Table = ({ headers, children, className = '' }) => (
    <div className={`overflow-x-auto rounded-md shadow-lg border border-[#292929] ${className}`}>
        <table className="min-w-full w-full table-fixed bg-[#161616]">
            {headers && Array.isArray(headers) ? (
                <thead className="bg-[#1c1c1c]">
                    <tr>
                        {headers.map((header, index) => {
                            // header가 객체인 경우와 문자열인 경우를 모두 처리
                            const title = typeof header === 'object' ? header.title : header;
                            const width = typeof header === 'object' ? header.width : null;

                            return (
                                <th
                                    key={index}
                                    className={`py-4 px-5 text-left text-xs font-medium text-[#999] uppercase tracking-wider border-b border-[#292929] ${
                                        width ? width : ''
                                    }`}
                                >
                                    {title}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
            ) : null}
            <tbody className="divide-y divide-[#292929]">{children}</tbody>
        </table>
    </div>
);

// 테이블 행 컴포넌트
export const TableRow = ({ children, className = '' }) => (
    <tr className={`hover:bg-[#1a1a1a] transition-all duration-150 ${className}`}>{children}</tr>
);

// 테이블 셀 컴포넌트
export const TableCell = ({ children, className = '' }) => (
    <td className={`py-4 px-5 text-white ${className}`}>{children}</td>
);

// 비어있는 테이블 메시지
export const EmptyTableMessage = ({ children, message, colSpan }) => (
    <tr>
        <td colSpan={colSpan || 6} className="py-12 px-5 text-center">
            <div className="flex flex-col items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mb-4 text-[#444] opacity-80"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                </svg>
                <p className="text-[#777] text-base font-medium">{children || message}</p>
            </div>
        </td>
    </tr>
);

export default {
    Table,
    TableRow,
    TableCell,
    EmptyTableMessage,
};
