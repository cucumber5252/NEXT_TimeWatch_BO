'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardHeader } from '../ui/Card';
import { Table, TableRow, TableCell, EmptyTableMessage } from '../ui/Table';
import { PrimaryButton, SecondaryButton } from '../ui/Button';
import { InputField, SelectField, KeywordInputField } from '../ui/FormElements';

/**
 * 도메인을 정규화하는 함수
 * URL 프로토콜, www, 경로, 포트 등을 제거하고 기본 도메인만 추출
 * @param {string} domain 정규화할 도메인 문자열
 * @returns {string} 정규화된 도메인
 */
function normalizeDomain(domain) {
    if (!domain) return '';

    try {
        // 프로토콜 제거
        let normalizedDomain = domain.replace(/^https?:\/\//i, '');
        // www 제거
        normalizedDomain = normalizedDomain.replace(/^www\./i, '');
        // 경로 및 쿼리스트링 제거
        normalizedDomain = normalizedDomain.split('/')[0];
        // 포트 번호 제거
        normalizedDomain = normalizedDomain.split(':')[0];
        return normalizedDomain.toLowerCase().trim();
    } catch (error) {
        console.error('도메인 정규화 오류:', error);
        return domain; // 오류 발생 시 원본 반환
    }
}

const UnmappedDomainManager = () => {
    const [domains, setDomains] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    });
    const [sort, setSort] = useState('visits');
    const [order, setOrder] = useState('desc');
    const [search, setSearch] = useState('');
    const [searchDebounce, setSearchDebounce] = useState(null);

    // 초기 데이터 로드
    useEffect(() => {
        loadDomains();
    }, [pagination.page, sort, order]);

    // 검색어 디바운싱
    useEffect(() => {
        if (searchDebounce) clearTimeout(searchDebounce);

        setSearchDebounce(
            setTimeout(() => {
                loadDomains();
            }, 500)
        );

        return () => {
            if (searchDebounce) clearTimeout(searchDebounce);
        };
    }, [search]);

    // 미매핑 도메인 데이터 가져오기
    const loadDomains = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/admin/unmapped-domains', {
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                    sort,
                    order,
                    search,
                },
            });

            // 각 도메인에 대해 기본 편집 상태 설정 - 모두 인라인 편집 모드로 시작
            const domainsWithEditState = response.data.domains.map((domain) => ({
                ...domain,
                formData: {
                    name: domainToName(domain.domain),
                    domain: domain.domain,
                    keyword: [],
                },
                currentKeyword: '',
            }));

            setDomains(domainsWithEditState);
            setPagination((prev) => ({
                ...prev,
                total: response.data.pagination.total,
                totalPages: response.data.pagination.totalPages,
            }));
        } catch (error) {
            console.error('미매핑 도메인 데이터 가져오기 오류:', error);
            toast.error('데이터를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 정렬 변경 처리
    const handleSortChange = (e) => {
        const newSort = e.target.value;
        setSort(newSort);
        setPagination((prev) => ({ ...prev, page: 1 })); // 페이지 초기화
    };

    // 정렬 순서 변경
    const handleOrderChange = (e) => {
        const newOrder = e.target.value;
        setOrder(newOrder);
        setPagination((prev) => ({ ...prev, page: 1 })); // 페이지 초기화
    };

    // 검색어 변경 처리
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPagination((prev) => ({ ...prev, page: 1 })); // 페이지 초기화
    };

    // 페이지 변경 처리
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    // 인라인 입력 필드 변경 처리
    const handleInlineInputChange = (domain, field, value) => {
        setDomains((prev) =>
            prev.map((d) =>
                d.domain === domain.domain
                    ? {
                          ...d,
                          formData: {
                              ...d.formData,
                              [field]: value,
                          },
                      }
                    : d
            )
        );
    };

    // 인라인 키워드 관련 함수들
    const handleKeywordChange = (domain, value) => {
        setDomains((prev) => prev.map((d) => (d.domain === domain.domain ? { ...d, currentKeyword: value } : d)));
    };

    const addKeyword = (domain) => {
        const domainObj = domains.find((d) => d.domain === domain.domain);
        if (!domainObj || !domainObj.currentKeyword.trim()) return;

        const currentKeyword = domainObj.currentKeyword;

        // 쉼표로 구분된 키워드 처리
        if (currentKeyword.includes(',')) {
            const keywordsArray = currentKeyword
                .split(',')
                .map((k) => k.trim())
                .filter((k) => k.length > 0);

            if (keywordsArray.length > 0) {
                const newKeywords = [...domainObj.formData.keyword];

                keywordsArray.forEach((keyword) => {
                    if (!newKeywords.includes(keyword)) {
                        newKeywords.push(keyword);
                    }
                });

                setDomains((prev) =>
                    prev.map((d) =>
                        d.domain === domain.domain
                            ? {
                                  ...d,
                                  formData: {
                                      ...d.formData,
                                      keyword: newKeywords,
                                  },
                                  currentKeyword: '',
                              }
                            : d
                    )
                );
            }
        } else if (!domainObj.formData.keyword.includes(currentKeyword.trim())) {
            setDomains((prev) =>
                prev.map((d) =>
                    d.domain === domain.domain
                        ? {
                              ...d,
                              formData: {
                                  ...d.formData,
                                  keyword: [...d.formData.keyword, currentKeyword.trim()],
                              },
                              currentKeyword: '',
                          }
                        : d
                )
            );
        }
    };

    const removeKeyword = (domain, keywordToRemove) => {
        setDomains((prev) =>
            prev.map((d) =>
                d.domain === domain.domain
                    ? {
                          ...d,
                          formData: {
                              ...d.formData,
                              keyword: d.formData.keyword.filter((k) => k !== keywordToRemove),
                          },
                      }
                    : d
            )
        );
    };

    const handleKeywordKeyDown = (e, domain) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addKeyword(domain);
        }
    };

    // 매핑 제출
    const handleInlineSubmit = async (domain) => {
        const domainObj = domains.find((d) => d.domain === domain.domain);
        if (!domainObj) return;

        const { formData } = domainObj;

        if (!formData.name || !formData.domain) {
            toast.error('이름과 도메인은 필수 입력 항목입니다.');
            return;
        }

        try {
            setIsLoading(true);

            // 마지막으로 입력 중인 키워드가 있다면 추가
            if (domainObj.currentKeyword.trim()) {
                addKeyword(domain);
            }

            const data = {
                keyword: formData.keyword || [],
                domain: formData.domain,
                name: formData.name,
            };

            const response = await axios.post('/api/admin/mappings', data);
            toast.success('매핑이 성공적으로 생성되었습니다.');

            // 목록에서 매핑된 도메인 제거
            setDomains((prev) => prev.filter((d) => d.domain !== domain.domain));

            // 페이지네이션 정보 업데이트
            setPagination((prev) => ({
                ...prev,
                total: prev.total - 1,
                totalPages: Math.ceil((prev.total - 1) / prev.limit),
            }));
        } catch (error) {
            console.error('매핑 저장 오류:', error);
            toast.error(error.response?.data?.error || '매핑 저장에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 도메인을 이름으로 변환하는 도우미 함수
    const domainToName = (domain) => {
        // 도메인 정규화
        const normalizedDomain = normalizeDomain(domain);

        // 최상위 도메인(.com, .net 등) 제거
        let name = normalizedDomain.split('.')[0];

        // 첫 글자 대문자화
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    if (isLoading && domains.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="p-6 bg-[#161616] rounded-md shadow-md text-center">
                    <div className="w-10 h-10 border-2 border-t-[#0077FF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-white">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader title="미매핑 도메인 관리" />

            {/* 검색 및 필터링 */}
            <div className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <InputField
                        label="도메인 검색"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="도메인 검색..."
                        className="w-full sm:w-1/3"
                    />

                    <div className="flex gap-2 w-full sm:w-2/3 flex-wrap sm:flex-nowrap">
                        <SelectField
                            label="정렬 기준"
                            value={sort}
                            onChange={handleSortChange}
                            options={[
                                { value: 'visits', label: '방문 횟수' },
                                { value: 'recent', label: '최근 방문' },
                                { value: 'domain', label: '도메인' },
                            ]}
                            className="w-full sm:w-1/2"
                        />

                        <SelectField
                            label="정렬 순서"
                            value={order}
                            onChange={handleOrderChange}
                            options={[
                                { value: 'desc', label: '내림차순' },
                                { value: 'asc', label: '오름차순' },
                            ]}
                            className="w-full sm:w-1/2"
                        />
                    </div>
                </div>

                {/* 도메인 목록 테이블 */}
                <Table
                    headers={[
                        { title: '도메인', width: 'w-[25%]' },
                        { title: '이름', width: 'w-[25%]' },
                        { title: '키워드', width: 'w-[35%]' },
                        { title: '작업', width: 'w-[15%]' },
                    ]}
                >
                    {domains.length > 0 ? (
                        domains.map((domain) => (
                            <TableRow key={domain.normalizedDomain || domain.domain}>
                                {/* 도메인 정보 칼럼 */}
                                <TableCell className="w-[25%]">
                                    <div className="truncate">{domain.domain}</div>
                                </TableCell>

                                {/* 이름 입력 칼럼 */}
                                <TableCell className="w-[25%]">
                                    <InputField
                                        value={domain.formData.name}
                                        onChange={(e) => handleInlineInputChange(domain, 'name', e.target.value)}
                                        placeholder="웹사이트 이름"
                                    />
                                </TableCell>

                                {/* 키워드 입력 칼럼 */}
                                <TableCell className="w-[35%]">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={domain.currentKeyword}
                                                onChange={(e) => handleKeywordChange(domain, e.target.value)}
                                                onKeyDown={(e) => handleKeywordKeyDown(e, domain)}
                                                placeholder="키워드 입력 후 엔터"
                                                className="flex-1 p-2 bg-[#222] text-white border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077FF] transition-standard"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => addKeyword(domain)}
                                                className="px-3 py-2 bg-[#333] hover:bg-[#444] text-white rounded-md transition-standard"
                                            >
                                                추가
                                            </button>
                                        </div>

                                        {domain.formData.keyword.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {domain.formData.keyword.map((kw, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center bg-[#222] text-white px-2 py-1 rounded-md"
                                                    >
                                                        <span className="mr-1">{kw}</span>
                                                        <button
                                                            onClick={() => removeKeyword(domain, kw)}
                                                            className="text-gray-400 hover:text-white"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>

                                {/* 작업 버튼 칼럼 */}
                                <TableCell className="w-[15%]">
                                    <PrimaryButton
                                        onClick={() => handleInlineSubmit(domain)}
                                        disabled={isLoading}
                                        className="w-full"
                                    >
                                        매핑하기
                                    </PrimaryButton>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <EmptyTableMessage
                            message={search ? '검색 결과가 없습니다.' : '매핑되지 않은 도메인이 없습니다.'}
                            colSpan={4}
                        />
                    )}
                </Table>

                {/* 페이지네이션 */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                        <nav className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(1)}
                                disabled={pagination.page === 1}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    pagination.page === 1
                                        ? 'bg-[#222] text-[#666] cursor-not-allowed'
                                        : 'bg-[#333] text-white hover:bg-[#444]'
                                }`}
                            >
                                &laquo;
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    pagination.page === 1
                                        ? 'bg-[#222] text-[#666] cursor-not-allowed'
                                        : 'bg-[#333] text-white hover:bg-[#444]'
                                }`}
                            >
                                &lsaquo;
                            </button>

                            <div className="text-white">
                                {pagination.page} / {pagination.totalPages}
                            </div>

                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    pagination.page === pagination.totalPages
                                        ? 'bg-[#222] text-[#666] cursor-not-allowed'
                                        : 'bg-[#333] text-white hover:bg-[#444]'
                                }`}
                            >
                                &rsaquo;
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.totalPages)}
                                disabled={pagination.page === pagination.totalPages}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    pagination.page === pagination.totalPages
                                        ? 'bg-[#222] text-[#666] cursor-not-allowed'
                                        : 'bg-[#333] text-white hover:bg-[#444]'
                                }`}
                            >
                                &raquo;
                            </button>
                        </nav>
                    </div>
                )}

                {/* 통계 정보 */}
                <div className="bg-[#1a1a1a] p-3 rounded-md text-sm text-[#999] mt-4">
                    전체 {pagination.total}개의 미매핑 도메인 중 {domains.length}개 표시 중
                </div>
            </div>
        </Card>
    );
};

export default UnmappedDomainManager;
