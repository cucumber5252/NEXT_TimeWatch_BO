'use client';

import React from 'react';

// 입력 필드
export const InputField = ({ label, name, value, onChange, placeholder, required, type = 'text', className = '' }) => (
    <div className={`space-y-2.5 ${className}`}>
        <label htmlFor={name} className="block text-sm font-medium text-[#bbb]">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className="w-full py-2.5 px-3.5 bg-[#1a1a1a] text-white border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077FF] focus:border-transparent transition-all duration-200"
            />
        </div>
    </div>
);

// 텍스트 영역
export const TextAreaField = ({ label, name, value, onChange, placeholder, required, rows = 3, className = '' }) => (
    <div className={`space-y-2.5 ${className}`}>
        <label htmlFor={name} className="block text-sm font-medium text-[#bbb]">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            rows={rows}
            className="w-full py-2.5 px-3.5 bg-[#1a1a1a] text-white border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077FF] focus:border-transparent transition-all duration-200"
        />
    </div>
);

// 셀렉트 박스
export const SelectField = ({ label, name, value, onChange, options = [], required, className = '', children }) => (
    <div className={`space-y-2.5 ${className}`}>
        <label htmlFor={name} className="block text-sm font-medium text-[#bbb]">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="w-full py-2.5 pl-3.5 pr-10 bg-[#1a1a1a] text-white border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077FF] focus:border-transparent transition-all duration-200 appearance-none"
            >
                {children ||
                    (options &&
                        options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        )))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                    className="h-5 w-5 text-[#777]"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
        </div>
    </div>
);

// 키워드 입력 필드
export const KeywordInputField = ({
    label,
    currentKeyword,
    onKeywordChange,
    onKeyDown,
    onAddKeyword,
    keywords,
    onRemoveKeyword,
    required,
    className = '',
}) => (
    <div className={`space-y-2.5 ${className}`}>
        <label className="block text-sm font-medium text-[#bbb]">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex shadow-sm">
            <input
                type="text"
                value={currentKeyword}
                onChange={onKeywordChange}
                onKeyDown={onKeyDown}
                className="flex-1 py-2.5 px-3.5 bg-[#1a1a1a] text-white border border-[#333] border-r-0 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#0077FF] focus:border-transparent transition-all duration-200"
                placeholder="키워드 입력 후 엔터 또는 추가 버튼 클릭 (쉼표로 구분 가능)"
            />
            <button
                type="button"
                onClick={onAddKeyword}
                className="px-4 py-2.5 bg-[#333] text-white rounded-r-md hover:bg-[#444] focus:outline-none focus:ring-2 focus:ring-[#0077FF] focus:ring-opacity-30 active:scale-[0.98] transition-all duration-200"
            >
                추가
            </button>
        </div>

        {/* 키워드 입력 도움말 */}
        <p className="text-xs text-[#777] pl-1">쉼표(,)로 구분하여 여러 키워드를 한 번에 추가할 수 있습니다.</p>

        {/* 키워드 목록 */}
        <div className="flex flex-wrap gap-2 mt-1 p-3 bg-[#1a1a1a] min-h-[2.5rem] rounded-md border border-[#333]">
            {keywords && keywords.length > 0 ? (
                keywords.map((keyword, idx) => (
                    <div
                        key={idx}
                        className="flex items-center bg-[#272727] px-2.5 py-1.5 rounded-full transition-all duration-200 hover:bg-[#333] group"
                    >
                        <span className="text-sm text-white mr-1.5">{keyword}</span>
                        <button
                            type="button"
                            onClick={() => onRemoveKeyword(keyword)}
                            className="text-[#999] hover:text-white focus:outline-none transition-all duration-200 w-5 h-5 flex items-center justify-center rounded-full bg-[#333] group-hover:bg-[#444]"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                ))
            ) : (
                <span className="text-sm text-[#666] py-1">추가된 키워드가 없습니다</span>
            )}
        </div>
    </div>
);

export default {
    InputField,
    TextAreaField,
    SelectField,
    KeywordInputField,
};
