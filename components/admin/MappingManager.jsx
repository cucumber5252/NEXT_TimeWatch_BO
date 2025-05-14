'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Card, CardHeader } from '../ui/Card';
import { Table, TableRow, TableCell, EmptyTableMessage } from '../ui/Table';
import { PrimaryButton, SecondaryButton, DangerButton, TabButton } from '../ui/Button';
import { InputField, KeywordInputField } from '../ui/FormElements';

const MappingManager = () => {
    const [mappings, setMappings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('list'); // list, add, edit
    const [searchTerm, setSearchTerm] = useState('');
    const [editingMapping, setEditingMapping] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        keyword: [],
    });
    const [currentKeyword, setCurrentKeyword] = useState('');

    // 초기 데이터 로드
    useEffect(() => {
        loadMappings();
    }, []);

    // 매핑 데이터 가져오기
    const loadMappings = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/admin/mappings');
            setMappings(response.data);
        } catch (error) {
            console.error('매핑 데이터 가져오기 오류:', error);
            toast.error('매핑 데이터를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 입력 필드 변경
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 폼 제출
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsLoading(true);

            // 마지막으로 입력 중인 키워드가 있다면 추가
            if (currentKeyword.trim()) {
                addKeyword();
            }

            console.log('폼 데이터:', formData);
            console.log('현재 키워드:', formData.keyword);

            const data = {
                keyword: formData.keyword || [],
                domain: formData.domain,
                name: formData.name,
            };

            console.log('서버로 전송되는 데이터:', data);

            let response;

            if (activeTab === 'edit' && editingMapping) {
                // 수정 요청
                response = await axios.put('/api/admin/mappings', {
                    ...data,
                    _id: editingMapping._id,
                });
                toast.success('매핑이 성공적으로 수정되었습니다.');
            } else {
                // 생성 요청
                response = await axios.post('/api/admin/mappings', data);
                toast.success('새 매핑이 성공적으로 생성되었습니다.');
            }

            console.log('서버 응답:', response.data);

            // 데이터 새로고침
            await loadMappings();
            // 폼 초기화
            resetForm();
            // 목록 보기로 전환
            setActiveTab('list');
        } catch (error) {
            console.error('매핑 저장 오류:', error);
            console.error('오류 상세:', error.response?.data);
            toast.error(error.response?.data?.error || '매핑 저장에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 삭제
    const handleDelete = async (mapping) => {
        if (!confirm(`"${mapping.name}" 매핑을 삭제하시겠습니까?`)) return;

        try {
            setIsLoading(true);
            await axios.delete('/api/admin/mappings', {
                data: { _id: mapping._id },
            });

            toast.success('매핑이 성공적으로 삭제되었습니다.');
            await loadMappings();
        } catch (error) {
            console.error('매핑 삭제 오류:', error);
            toast.error('매핑 삭제에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    // 매핑 편집
    const handleEdit = (mapping) => {
        setEditingMapping(mapping);
        setFormData({
            name: mapping.name,
            domain: mapping.domain,
            keyword: mapping.keyword || [],
        });
        setActiveTab('edit');
    };

    // 폼 초기화
    const resetForm = () => {
        setFormData({
            name: '',
            domain: '',
            keyword: [],
        });
        setCurrentKeyword('');
        setEditingMapping(null);
    };

    // 키워드 추가
    const addKeyword = () => {
        if (!currentKeyword.trim()) return;

        // 쉼표로 구분된 키워드 처리
        if (currentKeyword.includes(',')) {
            const keywordsArray = currentKeyword
                .split(',')
                .map((k) => k.trim())
                .filter((k) => k.length > 0);

            if (keywordsArray.length > 0) {
                const newKeywords = [...formData.keyword];

                keywordsArray.forEach((keyword) => {
                    if (!newKeywords.includes(keyword)) {
                        newKeywords.push(keyword);
                    }
                });

                setFormData((prev) => ({
                    ...prev,
                    keyword: newKeywords,
                }));
            }
        } else if (!formData.keyword.includes(currentKeyword.trim())) {
            setFormData((prev) => ({
                ...prev,
                keyword: [...prev.keyword, currentKeyword.trim()],
            }));
        }

        setCurrentKeyword('');
    };

    // 키워드 삭제
    const removeKeyword = (keywordToRemove) => {
        setFormData((prev) => ({
            ...prev,
            keyword: prev.keyword.filter((k) => k !== keywordToRemove),
        }));
    };

    // 현재 키워드 입력 처리
    const handleKeywordChange = (e) => {
        setCurrentKeyword(e.target.value);
    };

    // 키워드 입력에서 엔터 처리
    const handleKeywordKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addKeyword();
        }
    };

    // 검색 필터링된 매핑 목록
    const filteredMappings = mappings.filter(
        (mapping) =>
            mapping.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mapping.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (mapping.keyword && mapping.keyword.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    if (isLoading && mappings.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="p-6 bg-[#161616] rounded-lg shadow-md text-center">
                    <div className="w-16 h-16 border-4 border-t-[#0077FF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader
                title="매핑 관리"
                rightElement={
                    <div className="flex space-x-2">
                        <TabButton active={activeTab === 'list'} onClick={() => setActiveTab('list')}>
                            매핑 목록
                        </TabButton>
                        <TabButton
                            active={activeTab === 'add'}
                            onClick={() => {
                                resetForm();
                                setActiveTab('add');
                            }}
                        >
                            새 매핑 추가
                        </TabButton>
                    </div>
                }
            />

            {/* 매핑 목록 */}
            {activeTab === 'list' && (
                <div className="space-y-4 p-5">
                    {/* 검색 */}
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="이름, 도메인, 키워드로 검색..."
                            className="flex-1 p-2 bg-[#222] text-white border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0077FF] transition-standard"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* 매핑 목록 테이블 */}
                    <Table
                        headers={[
                            { title: '이름', width: 'w-1/5' },
                            { title: '도메인', width: 'w-[15%]' },
                            { title: '키워드', width: 'w-[45%]' },
                            { title: '작업', width: 'w-[20%]' },
                        ]}
                    >
                        {filteredMappings.length > 0 ? (
                            filteredMappings.map((mapping) => (
                                <TableRow key={mapping._id}>
                                    <TableCell className="w-1/5 min-w-[120px]">{mapping.name}</TableCell>
                                    <TableCell className="w-[15%] min-w-[100px] relative group">
                                        <div className="truncate">{mapping.domain}</div>
                                        {mapping.domain.length > 20 && (
                                            <div className="absolute z-10 hidden group-hover:block bg-[#333] text-white p-2 rounded-md shadow-lg whitespace-normal max-w-xs">
                                                {mapping.domain}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="w-[45%]">
                                        <div className="flex flex-wrap gap-1">
                                            {mapping.keyword &&
                                                mapping.keyword.map((kw, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="inline-block px-2 py-1 bg-[#333] rounded-full text-xs"
                                                    >
                                                        {kw}
                                                    </span>
                                                ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-[20%]">
                                        <div className="flex space-x-2">
                                            <SecondaryButton onClick={() => handleEdit(mapping)}>수정</SecondaryButton>
                                            <DangerButton onClick={() => handleDelete(mapping)}>삭제</DangerButton>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <EmptyTableMessage
                                message={searchTerm ? '검색 결과가 없습니다.' : '등록된 매핑이 없습니다.'}
                                colSpan={4}
                            />
                        )}
                    </Table>
                </div>
            )}

            {/* 매핑 추가/수정 폼 */}
            {(activeTab === 'add' || activeTab === 'edit') && (
                <form onSubmit={handleSubmit} className="space-y-4 p-5">
                    <h3 className="text-xl font-semibold text-white">
                        {activeTab === 'add' ? '새 매핑 추가' : `매핑 수정: ${editingMapping?.name}`}
                    </h3>

                    <InputField
                        label="이름"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="예: 네이버, 카카오, 멜론 등"
                        required
                    />

                    <InputField
                        label="도메인"
                        name="domain"
                        value={formData.domain}
                        onChange={handleInputChange}
                        placeholder="예: naver.com, kakao.com (http:// 없이)"
                        required
                    />

                    <KeywordInputField
                        label="키워드 (선택, 쉼표나 엔터로 구분)"
                        currentKeyword={currentKeyword}
                        onKeywordChange={handleKeywordChange}
                        onKeyDown={handleKeywordKeyDown}
                        onAddKeyword={addKeyword}
                        keywords={formData.keyword}
                        onRemoveKeyword={removeKeyword}
                    />

                    <div className="flex justify-end space-x-4 pt-4">
                        <SecondaryButton
                            onClick={() => {
                                resetForm();
                                setActiveTab('list');
                            }}
                        >
                            취소
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={isLoading}>
                            {isLoading ? '처리 중...' : activeTab === 'add' ? '매핑 추가' : '매핑 수정'}
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </Card>
    );
};

export default MappingManager;
