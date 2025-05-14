'use client';

import React from 'react';

// 기본 카드 컴포넌트
export const Card = ({ children, className = '' }) => (
    <div
        className={`bg-[#161616] shadow-lg rounded-lg overflow-hidden border border-[#292929] transition-all duration-200 ${className}`}
    >
        {children}
    </div>
);

// 카드 헤더 컴포넌트
export const CardHeader = ({ title, subtitle, rightElement, className = '', titleClassName = '' }) => (
    <div className={`flex justify-between items-center border-b border-[#292929] p-5 ${className}`}>
        <div>
            <h2 className={`text-xl font-bold text-white ${titleClassName}`}>{title}</h2>
            {subtitle && <p className="text-sm text-[#999] mt-1">{subtitle}</p>}
        </div>
        {rightElement && <div>{rightElement}</div>}
    </div>
);

// 카드 콘텐츠 컴포넌트
export const CardContent = ({ children, className = '' }) => <div className={`p-5 ${className}`}>{children}</div>;

// 카드 섹션 컴포넌트
export const CardSection = ({ title, subtitle, children, className = '' }) => (
    <div className={`p-5 ${className}`}>
        {title && (
            <div className="mb-5 border-b border-[#292929] pb-3">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                {subtitle && <p className="text-sm text-[#999] mt-1">{subtitle}</p>}
            </div>
        )}
        <div className="space-y-5">{children}</div>
    </div>
);

// 카드 푸터 컴포넌트
export const CardFooter = ({ children, className = '' }) => (
    <div className={`p-5 border-t border-[#292929] ${className}`}>{children}</div>
);

// 카드 액션 버튼 그룹
export const CardActions = ({ children, className = '' }) => (
    <div className={`flex justify-end items-center gap-3 ${className}`}>{children}</div>
);

export default {
    Card,
    CardHeader,
    CardContent,
    CardSection,
    CardFooter,
    CardActions,
};
