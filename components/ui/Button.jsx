'use client';

import React from 'react';

// 버튼 공통 스타일 및 사이즈 정의
const getSizeClasses = (size) => {
    switch (size) {
        case 'xs':
            return 'px-2 py-1 text-xs';
        case 'sm':
            return 'px-3 py-1.5 text-sm';
        case 'md':
            return 'px-4 py-2.5 text-sm';
        case 'lg':
            return 'px-5 py-3 text-base';
        default:
            return 'px-4 py-2.5 text-sm';
    }
};

// 기본 버튼 (녹색)
export const PrimaryButton = ({
    children,
    onClick,
    disabled,
    type = 'button',
    size = 'md',
    icon,
    className = '',
    fullWidth = false,
}) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${getSizeClasses(size)} ${fullWidth ? 'w-full' : ''} bg-[#0077FF] text-white rounded-md font-medium hover:bg-[#0066DD] focus:outline-none focus:ring-2 focus:ring-[#0077FF] focus:ring-opacity-50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0077FF] disabled:active:scale-100 transition-all duration-200 ${className}`}
    >
        {icon && <span className={`inline-block ${children ? 'mr-2' : ''}`}>{icon}</span>}
        {children}
    </button>
);

// 보조 버튼 (회색)
export const SecondaryButton = ({
    children,
    onClick,
    disabled,
    type = 'button',
    size = 'md',
    icon,
    className = '',
    fullWidth = false,
}) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${getSizeClasses(size)} ${fullWidth ? 'w-full' : ''} bg-[#333] text-white rounded-md font-medium hover:bg-[#444] focus:outline-none focus:ring-2 focus:ring-[#444] focus:ring-opacity-50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#333] disabled:active:scale-100 transition-all duration-200 ${className}`}
    >
        {icon && <span className={`inline-block ${children ? 'mr-2' : ''}`}>{icon}</span>}
        {children}
    </button>
);

// 위험 버튼 (빨간색)
export const DangerButton = ({
    children,
    onClick,
    disabled,
    type = 'button',
    size = 'md',
    icon,
    className = '',
    fullWidth = false,
}) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`${getSizeClasses(size)} ${fullWidth ? 'w-full' : ''} bg-[#e53e3e] text-white rounded-md font-medium hover:bg-[#c53030] focus:outline-none focus:ring-2 focus:ring-[#e53e3e] focus:ring-opacity-50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#e53e3e] disabled:active:scale-100 transition-all duration-200 ${className}`}
    >
        {icon && <span className={`inline-block ${children ? 'mr-2' : ''}`}>{icon}</span>}
        {children}
    </button>
);

// 아웃라인 버튼
export const OutlineButton = ({
    children,
    onClick,
    disabled,
    type = 'button',
    size = 'md',
    icon,
    color = 'gray', // gray, green, red
    className = '',
    fullWidth = false,
}) => {
    const colorClasses = {
        gray: 'border-[#555] text-[#ddd] hover:bg-[#333] focus:ring-[#555]',
        green: 'border-[#0077FF] text-[#0077FF] hover:bg-[#0077FF]/10 focus:ring-[#0077FF]',
        red: 'border-[#e53e3e] text-[#e53e3e] hover:bg-[#e53e3e]/10 focus:ring-[#e53e3e]',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${getSizeClasses(size)} ${fullWidth ? 'w-full' : ''} bg-transparent border ${
                colorClasses[color] || colorClasses.gray
            } rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:active:scale-100 transition-all duration-200 ${className}`}
        >
            {icon && <span className={`inline-block ${children ? 'mr-2' : ''}`}>{icon}</span>}
            {children}
        </button>
    );
};

// 탭 버튼
export const TabButton = ({ children, active, onClick, size = 'md', icon, className = '' }) => (
    <button
        type="button"
        onClick={onClick}
        className={`${getSizeClasses(size)} rounded-md font-medium focus:outline-none transition-all duration-200 flex items-center justify-center ${
            active
                ? 'bg-[#0077FF] text-white shadow-sm active:scale-[0.98]'
                : 'bg-[#222] text-[#ccc] hover:text-white hover:bg-[#333] active:scale-[0.98]'
        } ${className}`}
    >
        {icon && <span className={`inline-block ${children ? 'mr-2' : ''}`}>{icon}</span>}
        {children}
    </button>
);

// 아이콘 버튼
export const IconButton = ({
    icon,
    onClick,
    disabled,
    title,
    size = 'md',
    variant = 'primary', // primary, secondary, danger, outline
    className = '',
}) => {
    const sizeClasses = {
        xs: 'w-6 h-6 p-1',
        sm: 'w-8 h-8 p-1.5',
        md: 'w-10 h-10 p-2',
        lg: 'w-12 h-12 p-2.5',
    };

    const variantClasses = {
        primary: 'bg-[#0077FF] text-white hover:bg-[#0066DD] focus:ring-[#0077FF]',
        secondary: 'bg-[#333] text-white hover:bg-[#444] focus:ring-[#444]',
        danger: 'bg-[#e53e3e] text-white hover:bg-[#c53030] focus:ring-[#e53e3e]',
        outline: 'bg-transparent border border-[#555] text-[#ddd] hover:bg-[#333] focus:ring-[#555]',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`${sizeClasses[size] || sizeClasses.md} ${
                variantClasses[variant] || variantClasses.primary
            } rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-opacity-50 active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-200 ${className}`}
        >
            {icon}
        </button>
    );
};

export default {
    PrimaryButton,
    SecondaryButton,
    DangerButton,
    OutlineButton,
    TabButton,
    IconButton,
};
