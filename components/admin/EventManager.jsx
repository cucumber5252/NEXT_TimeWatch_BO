'use client';

import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { Card, CardHeader, CardContent, CardSection, CardFooter, CardActions } from '../ui/Card';
import { Table, TableRow, TableCell, EmptyTableMessage } from '../ui/Table';
import { PrimaryButton, SecondaryButton, DangerButton, TabButton } from '../ui/Button';
import { InputField, TextAreaField, SelectField } from '../ui/FormElements';

const EventManager = () => {
    const [events, setEvents] = useState({});
    const [selectedDate, setSelectedDate] = useState('');
    const [modalSelectedDate, setModalSelectedDate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('list'); // list, edit
    const [sortedDates, setSortedDates] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState(['전체']);
    const [isMobile, setIsMobile] = useState(false);
    const [editEvent, setEditEvent] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);
    const [isActionInProgress, setIsActionInProgress] = useState(false);
    const router = useRouter();

    const [newEvent, setNewEvent] = useState({
        id: '',
        time: '00:00',
        title: '',
        link: '',
        img: '',
        category: '예매',
        companies: [{ name: '', link: '' }],
    });

    useEffect(() => {
        loadEvents();

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadEvents = useCallback(async () => {
        try {
            setIsLoading(true);

            // 현재 window.location의 포트를 사용하여 동적으로 URL 생성
            const apiUrl =
                typeof window !== 'undefined' ? `${window.location.origin}/api/admin/events` : '/api/admin/events';
            console.log('로딩 API URL:', apiUrl);

            const response = await fetch(apiUrl);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '이벤트 데이터를 불러오는데 실패했습니다.');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || '서버 오류');
            }

            // 데이터가 비어있는지 확인
            if (!data.data || Object.keys(data.data).length === 0) {
                setEvents({});
                setSortedDates([]);
                setSelectedDate('');
                console.log('이벤트 데이터가 없습니다.');
                return;
            }

            setEvents(data.data);
            const dates = Object.keys(data.data).sort().reverse();
            setSortedDates(dates);

            // 현재 선택된 날짜가 유효한지 확인
            const today = dayjs().format('YYYY-MM-DD');

            if (selectedDate && dates.includes(selectedDate)) {
                // 이미 선택된 날짜가 있고 그 날짜가 유효하면 유지
            } else if (dates.includes(today)) {
                // 오늘 날짜가 있으면 선택
                setSelectedDate(today);
            } else if (dates.length > 0) {
                // 그렇지 않으면 첫 번째 날짜 선택
                setSelectedDate(dates[0]);
            } else {
                // 날짜가 없으면 빈 값
                setSelectedDate('');
            }
        } catch (error) {
            console.error('이벤트 로딩 실패:', error);
            toast.error('이벤트 데이터를 불러오는데 실패했습니다: ' + error.message);
            setEvents({});
            setSortedDates([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDate]);

    // 현재 날짜 선택 핸들러
    function handleDateChange(date) {
        if (date) {
            const formattedDate = dayjs(date).format('YYYY-MM-DD');
            setSelectedDate(formattedDate);
            setSearchTerm(''); // 날짜 변경 시 검색어 초기화
        }
    }

    // 모달용 날짜 선택 핸들러
    function handleModalDateChange(date) {
        if (date) {
            const formattedDate = dayjs(date).format('YYYY-MM-DD');
            setModalSelectedDate(formattedDate);
        }
    }

    function handleCategoryChange(category) {
        if (category === '전체') {
            setSelectedCategories(['전체']);
        } else {
            const newCategories = selectedCategories.includes('전체')
                ? [category]
                : selectedCategories.includes(category)
                  ? selectedCategories.filter((c) => c !== category)
                  : [...selectedCategories, category];

            setSelectedCategories(newCategories.length ? newCategories : ['전체']);
        }
    }

    function handleSearchChange(e) {
        setSearchTerm(e.target.value);
    }

    function handleNewEventChange(e) {
        const { name, value } = e.target;

        if (name.startsWith('company_')) {
            const [_, index, field] = name.split('_');
            const updatedCompanies = [...(editEvent ? editEvent.companies : newEvent.companies)];
            if (!updatedCompanies[parseInt(index)]) {
                updatedCompanies[parseInt(index)] = { name: '', link: '' };
            }
            updatedCompanies[parseInt(index)][field] = value;

            if (editEvent) {
                setEditEvent({ ...editEvent, companies: updatedCompanies });
            } else {
                setNewEvent({ ...newEvent, companies: updatedCompanies });
            }
        } else {
            if (editEvent) {
                setEditEvent({ ...editEvent, [name]: value });
            } else {
                setNewEvent({ ...newEvent, [name]: value });
            }
        }
    }

    function addCompany() {
        if (editEvent) {
            setEditEvent({
                ...editEvent,
                companies: [...editEvent.companies, { name: '', link: '' }],
            });
        } else {
            setNewEvent({
                ...newEvent,
                companies: [...newEvent.companies, { name: '', link: '' }],
            });
        }
    }

    function removeCompany(index) {
        if (editEvent) {
            const updatedCompanies = [...editEvent.companies];
            updatedCompanies.splice(index, 1);
            setEditEvent({ ...editEvent, companies: updatedCompanies });
        } else {
            const updatedCompanies = [...newEvent.companies];
            updatedCompanies.splice(index, 1);
            setNewEvent({ ...newEvent, companies: updatedCompanies });
        }
    }

    function resetForm() {
        setNewEvent({
            id: '',
            time: '00:00',
            title: '',
            link: '',
            img: '',
            category: '예매',
            companies: [{ name: '', link: '' }],
        });
        setEditEvent(null);
    }

    async function saveNewEvent(e) {
        e.preventDefault();

        // 이벤트 추가 로직만 남기고 수정 관련 로직은 제거
        if (!modalSelectedDate) {
            toast.error('날짜를 선택해주세요.');
            return;
        }

        // 유효성 검사
        if (!newEvent.time || !newEvent.title || !newEvent.link || !newEvent.img || !newEvent.category) {
            toast.error('모든 필드를 입력해주세요.');
            return;
        }

        // 회사 정보 유효성 검사
        if (newEvent.companies.some((company) => !company.name || !company.link)) {
            toast.error('모든 회사 정보를 입력해주세요.');
            return;
        }

        try {
            setIsLoading(true);
            setIsActionInProgress(true);

            // 현재 window.location의 포트를 사용하여 동적으로 URL 생성
            const apiUrl = `${window.location.origin}/api/admin/events`;
            console.log('API 요청 URL:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: modalSelectedDate,
                    event: {
                        id: newEvent.id ? Number(newEvent.id) : undefined,
                        eventId: newEvent.id ? Number(newEvent.id) : undefined,
                        time: newEvent.time,
                        title: newEvent.title,
                        link: newEvent.link,
                        img: newEvent.img,
                        companies: newEvent.companies,
                        category: newEvent.category,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '이벤트 저장에 실패했습니다.');
            }

            await loadEvents();
            resetForm();
            toast.success('새 이벤트가 성공적으로 저장되었습니다!', {
                duration: 3000,
                style: {
                    background: '#0c3c17',
                    color: '#fff',
                    border: '1px solid #0077FF',
                },
                icon: '✅',
            });

            // 모달 닫기 및 상태 초기화
            setIsAddModalOpen(false);
            router.refresh();
        } catch (error) {
            console.error('저장 실패:', error);
            toast.error('저장 실패: ' + error.message, {
                duration: 4000,
                style: {
                    background: '#471818',
                    color: '#fff',
                    border: '1px solid #e53e3e',
                },
                icon: '❌',
            });
        } finally {
            setIsLoading(false);
            setIsActionInProgress(false);
        }
    }

    // 새로 추가: 이벤트 수정 저장 함수
    async function saveEditEvent(e) {
        e.preventDefault();

        if (!modalSelectedDate) {
            toast.error('날짜를 선택해주세요.');
            return;
        }

        // 유효성 검사
        if (!editEvent.time || !editEvent.title || !editEvent.link || !editEvent.img || !editEvent.category) {
            toast.error('모든 필드를 입력해주세요.');
            return;
        }

        // 회사 정보 유효성 검사
        if (editEvent.companies.some((company) => !company.name || !company.link)) {
            toast.error('모든 회사 정보를 입력해주세요.');
            return;
        }

        try {
            setIsLoading(true);
            setIsActionInProgress(true);

            // 디버깅 로그
            console.log('이벤트 수정 요청 준비:', {
                id: Number(editEvent.id),
                oldDate: editEvent.oldDate,
                newDate: modalSelectedDate,
                dateChanged: editEvent.oldDate !== modalSelectedDate,
            });

            // 현재 window.location의 포트를 사용하여 동적으로 URL 생성
            const apiUrl = `${window.location.origin}/api/admin/events`;
            console.log('PUT 요청 URL:', apiUrl);

            // 명확한 PUT 요청 본문 구성
            const body = JSON.stringify({
                date: modalSelectedDate, // 새 날짜
                event: {
                    id: Number(editEvent.id),
                    eventId: Number(editEvent.id),
                    time: editEvent.time,
                    title: editEvent.title,
                    link: editEvent.link,
                    img: editEvent.img,
                    companies: editEvent.companies,
                    category: editEvent.category,
                },
                oldDate: editEvent.oldDate, // 원래 날짜 (이벤트가 실제로 저장된 날짜)
            });

            console.log('요청 본문:', body);

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '이벤트 수정에 실패했습니다.');
            }

            await loadEvents();
            toast.success('이벤트 수정이 완료되었습니다!', {
                duration: 3000,
                style: {
                    background: '#0c3c17',
                    color: '#fff',
                    border: '1px solid #0077FF',
                },
                icon: '✅',
            });

            // 모달 닫기 및 상태 초기화
            setIsEditModalOpen(false);
            setEditEvent(null);
            router.refresh();
        } catch (error) {
            console.error('수정 실패:', error);
            toast.error('수정 실패: ' + error.message, {
                duration: 4000,
                style: {
                    background: '#471818',
                    color: '#fff',
                    border: '1px solid #e53e3e',
                },
                icon: '❌',
            });
        } finally {
            setIsLoading(false);
            setIsActionInProgress(false);
        }
    }

    // 이벤트 수정 모드 진입
    function handleEditEvent(event) {
        // 실제 이벤트가 저장된 날짜를 찾아야 함
        // selectedDate는 UI에서 보이는 현재 선택된 날짜이며
        // 실제 이벤트의 날짜와 일치해야 합니다

        // 이벤트가 저장된 날짜 찾기 (객체 순회)
        let eventDate = selectedDate;
        Object.keys(events).forEach((date) => {
            if (events[date]) {
                const foundEvent = events[date].find((e) => e.id === event.id);
                if (foundEvent) {
                    eventDate = date;
                }
            }
        });

        setEditEvent({
            ...event,
            id: Number(event.id),
            oldDate: eventDate, // 실제 이벤트가 저장된 날짜를 사용
        });

        console.log('수정 모드 진입:', {
            event,
            eventDate,
            numericId: Number(event.id),
        });

        // 수정 모달의 날짜를 현재 선택된 날짜로 설정
        setModalSelectedDate(eventDate);
        setIsEditModalOpen(true);
    }

    // 이벤트 수정 취소
    function cancelEdit() {
        setEditEvent(null);
        setIsEditModalOpen(false);
    }

    // 추가 모달 열기
    function openAddModal() {
        resetForm();
        // 모달 열 때 현재 선택된 날짜로 모달 날짜 초기화
        setModalSelectedDate(selectedDate || dayjs().format('YYYY-MM-DD'));
        setIsAddModalOpen(true);
    }

    // 추가 모달 닫기
    function closeAddModal() {
        setIsAddModalOpen(false);
        resetForm();
    }

    async function deleteEvent(eventId) {
        if (!confirm('정말로 이 이벤트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

        try {
            setIsLoading(true);
            setIsActionInProgress(true);

            // 현재 window.location의 포트를 사용하여 동적으로 URL 생성
            const apiUrl = `${window.location.origin}/api/admin/events`;
            console.log('DELETE 요청 URL:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: selectedDate,
                    eventId: Number(eventId),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '이벤트 삭제에 실패했습니다.');
            }

            await loadEvents();
            toast.success('이벤트가 성공적으로 삭제되었습니다!', {
                duration: 3000,
                style: {
                    background: '#0c3c17',
                    color: '#fff',
                    border: '1px solid #0077FF',
                },
                icon: '🗑️',
            });
            router.refresh();
        } catch (error) {
            console.error('삭제 실패:', error);
            toast.error('삭제 실패: ' + error.message, {
                duration: 4000,
                style: {
                    background: '#471818',
                    color: '#fff',
                    border: '1px solid #e53e3e',
                },
                icon: '❌',
            });
        } finally {
            setIsLoading(false);
            setIsActionInProgress(false);
        }
    }

    const filteredEvents =
        selectedDate && events[selectedDate]
            ? events[selectedDate].filter(
                  (event) =>
                      (selectedCategories.includes('전체') || selectedCategories.includes(event.category || '예매')) &&
                      (searchTerm === '' ||
                          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.companies.some((company) =>
                              company.name.toLowerCase().includes(searchTerm.toLowerCase())
                          ))
              )
            : [];

    // 카테고리별 이벤트 수 계산
    const categoryStats = {
        예매: 0,
        테마: 0,
        오프라인: 0,
        온라인: 0,
        발매: 0,
        신청: 0,
        쿠폰: 0,
    };

    const totalEvents = Object.values(events).reduce((acc, dateEvents) => {
        if (Array.isArray(dateEvents)) {
            dateEvents.forEach((event) => {
                if (event.category && categoryStats.hasOwnProperty(event.category)) {
                    categoryStats[event.category]++;
                }
            });
            return acc + dateEvents.length;
        }
        return acc;
    }, 0);

    // 오늘 이벤트 수
    const todayEvents = events[dayjs().format('YYYY-MM-DD')] ? events[dayjs().format('YYYY-MM-DD')].length : 0;

    if (isLoading && Object.keys(events).length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="p-6 bg-[#161616] rounded-lg shadow-md text-center">
                    <div className="w-16 h-16 border-4 border-t-[#0077FF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-white text-xl font-medium">이벤트 데이터 로딩 중...</p>
                    <p className="text-[#999] mt-2">잠시만 기다려주세요</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 상단 통계 카드 - 개선된 버전 */}
            <div
                className="bg-gradient-to-r from-[#161616] to-[#1a1a1a] p-5 rounded-xl shadow-lg border border-[#292929] overflow-hidden transition-all duration-300 ease-in-out"
                style={{ height: isDashboardExpanded ? 'auto' : '88px' }}
            >
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center">
                            이벤트 대시보드
                            <button
                                onClick={() => setIsDashboardExpanded(!isDashboardExpanded)}
                                className="ml-2 text-[#0077FF] p-1 hover:bg-[#0077FF]/10 rounded-full transition-colors"
                                title={isDashboardExpanded ? '접기' : '펼치기'}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-5 w-5 transition-transform ${isDashboardExpanded ? 'rotate-180' : ''}`}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </h3>
                        <p className="text-[#999] text-sm mt-1">
                            총 {sortedDates.length}개 날짜, {totalEvents}개 이벤트
                        </p>
                    </div>
                    <PrimaryButton
                        onClick={openAddModal}
                        icon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        }
                        disabled={isActionInProgress}
                    >
                        새 이벤트 추가
                    </PrimaryButton>
                </div>

                {/* 확장된 대시보드 내용 */}
                {isDashboardExpanded && (
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#292929]">
                        {/* 날짜 통계 */}
                        <div className="bg-[#101010] p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-white font-medium">날짜별 현황</h4>
                                <div className="bg-[#0077FF]/10 p-1.5 rounded-md">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-[#0077FF]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#aaa] text-sm">오늘</span>
                                    <div className="flex items-center">
                                        <span className="text-white font-medium">{todayEvents}개</span>
                                        <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-[#0077FF]/20 text-[#0077FF]">
                                            이벤트
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#aaa] text-sm">최근 등록 날짜</span>
                                    <span className="text-white font-medium">{sortedDates[0] || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#aaa] text-sm">첫 이벤트 날짜</span>
                                    <span className="text-white font-medium">
                                        {sortedDates[sortedDates.length - 1] || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 카테고리 통계 */}
                        <div className="bg-[#101010] p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-white font-medium">카테고리별 현황</h4>
                                <div className="bg-[#3b82f6]/10 p-1.5 rounded-md">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-[#3b82f6]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <div className="flex flex-col text-center p-2 bg-[#0c0c0c] rounded-md">
                                    <span className="text-xs text-[#aaa]">예매</span>
                                    <span className="text-[#0077FF] font-medium mt-1">{categoryStats['예매']}개</span>
                                </div>
                                <div className="flex flex-col text-center p-2 bg-[#0c0c0c] rounded-md">
                                    <span className="text-xs text-[#aaa]">발매</span>
                                    <span className="text-[#5eead4] font-medium mt-1">{categoryStats['발매']}개</span>
                                </div>
                                <div className="flex flex-col text-center p-2 bg-[#0c0c0c] rounded-md">
                                    <span className="text-xs text-[#aaa]">신청</span>
                                    <span className="text-[#a78bfa] font-medium mt-1">{categoryStats['신청']}개</span>
                                </div>
                                <div className="flex flex-col text-center p-2 bg-[#0c0c0c] rounded-md">
                                    <span className="text-xs text-[#aaa]">쿠폰</span>
                                    <span className="text-[#fcd34d] font-medium mt-1">{categoryStats['쿠폰']}개</span>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{totalEvents}</div>
                                    <div className="text-xs text-[#aaa]">총 이벤트 수</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 메인 카드 */}
            <Card className="overflow-hidden border-none rounded-xl shadow-lg">
                <CardHeader
                    title="이벤트 관리"
                    subtitle="이벤트 정보를 관리할 수 있습니다."
                    className="border-b border-[#292929] bg-gradient-to-r from-[#1a1a1a] to-[#242424]"
                />

                {/* 목록 화면 - 필터 */}
                <CardContent className="border-b border-[#292929] bg-[#1E1E1E] p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-start">
                        <div className="w-full lg:w-auto flex flex-col md:flex-row gap-4">
                            <div className="relative flex items-center min-w-[200px]">
                                <div className="absolute z-10 left-3 pointer-events-none">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-[#777]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <DatePicker
                                    selected={selectedDate ? new Date(selectedDate) : null}
                                    onChange={handleDateChange}
                                    dateFormat="yyyy-MM-dd"
                                    className="bg-[#161616] border border-[#333] text-white rounded-md pl-10 pr-3 py-2 w-full appearance-none focus:ring-2 focus:ring-[#0077FF] focus:outline-none transition-shadow"
                                    placeholderText="날짜 선택..."
                                    calendarClassName="bg-[#161616] border border-[#333] rounded-md shadow-lg text-white"
                                    locale={ko}
                                    highlightDates={sortedDates.map((date) => new Date(date))}
                                    filterDate={(date) => {
                                        return true; // 모든 날짜 선택 가능
                                    }}
                                    popperProps={{
                                        strategy: 'fixed',
                                    }}
                                    popperPlacement="bottom-start"
                                    showPopperArrow={false}
                                />
                            </div>

                            <div className="relative flex items-center min-w-[200px] md:min-w-[300px]">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-[#777] absolute left-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="이벤트 또는 회사명 검색..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="bg-[#161616] border border-[#333] text-white rounded-md pl-10 pr-3 py-2 w-full focus:ring-2 focus:ring-[#0077FF] focus:outline-none transition-shadow"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 text-[#777] hover:text-white transition-colors"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
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
                                )}
                            </div>
                        </div>

                        <div className="flex w-full md:w-auto flex-wrap gap-2 items-center overflow-x-auto">
                            <span className="text-white flex items-center gap-1">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-[#777]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                    />
                                </svg>
                                카테고리:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {['전체', '예매', '발매', '신청', '쿠폰'].map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryChange(category)}
                                        className={`text-xs px-3 py-1.5 rounded-full transition-all duration-200 ${
                                            selectedCategories.includes(category)
                                                ? category === '예매'
                                                    ? 'bg-[#0077FF] text-black font-medium'
                                                    : category === '테마'
                                                      ? 'bg-[#f59e0b] text-black font-medium'
                                                      : category === '온라인'
                                                        ? 'bg-[#3b82f6] text-black font-medium'
                                                        : category === '오프라인'
                                                          ? 'bg-[#ec4899] text-black font-medium'
                                                          : category === '발매'
                                                            ? 'bg-[#5eead4] text-black font-medium'
                                                            : category === '신청'
                                                              ? 'bg-[#a78bfa] text-black font-medium'
                                                              : category === '쿠폰'
                                                                ? 'bg-[#fcd34d] text-black font-medium'
                                                                : 'bg-[#555] text-white font-medium'
                                                : 'bg-[#161616] text-[#999] hover:text-white hover:bg-[#222]'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 검색 결과 요약 */}
                    <div className="mt-3 flex justify-between items-center text-sm">
                        <div className="text-[#aaa]">
                            {searchTerm ? (
                                <span>
                                    "<span className="text-white font-medium">{searchTerm}</span>" 검색 결과:
                                    <span className="ml-1 text-[#0077FF] font-medium">
                                        {filteredEvents.length}개
                                    </span>{' '}
                                    이벤트
                                </span>
                            ) : (
                                <span>
                                    {selectedDate} •
                                    <span className="ml-1 text-[#0077FF] font-medium">{filteredEvents.length}개</span>{' '}
                                    이벤트 표시
                                </span>
                            )}
                        </div>

                        {filteredEvents.length > 0 && (
                            <div className="text-[#aaa]">
                                {selectedCategories.includes('전체')
                                    ? '모든 카테고리'
                                    : selectedCategories.map((c) => `'${c}'`).join(', ')}
                            </div>
                        )}
                    </div>
                </CardContent>

                {/* 목록 화면 - 테이블 */}
                <CardContent className="bg-[#181818] p-0 relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 backdrop-blur-sm">
                            <div className="p-4 bg-[#161616] rounded-lg shadow-md">
                                <div className="w-8 h-8 border-4 border-t-[#0077FF] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="text-white mt-2">데이터 로딩 중...</p>
                            </div>
                        </div>
                    )}

                    {filteredEvents && filteredEvents.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full w-full table-fixed bg-[#161616]">
                                <thead className="bg-[#1c1c1c]">
                                    <tr>
                                        <th className="py-4 px-5 text-left text-xs font-medium text-[#999] uppercase tracking-wider border-b border-[#292929]">
                                            시간
                                        </th>
                                        <th className="py-4 px-5 text-left text-xs font-medium text-[#999] uppercase tracking-wider border-b border-[#292929]">
                                            제목
                                        </th>
                                        <th className="py-4 px-5 text-left text-xs font-medium text-[#999] uppercase tracking-wider border-b border-[#292929]">
                                            카테고리
                                        </th>
                                        <th className="py-4 px-5 text-left text-xs font-medium text-[#999] uppercase tracking-wider border-b border-[#292929]">
                                            회사
                                        </th>
                                        <th className="py-4 px-5 text-left text-xs font-medium text-[#999] uppercase tracking-wider border-b border-[#292929]">
                                            액션
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#292929]">
                                    {filteredEvents.map((event) => (
                                        <TableRow key={event.id} className="hover:bg-[#1a1a1a] transition-colors">
                                            <TableCell>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-[#777]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                    {event.time}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div
                                                    className="max-w-[300px] text-white font-medium truncate"
                                                    title={event.title}
                                                >
                                                    {searchTerm &&
                                                    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ? (
                                                        <span
                                                            dangerouslySetInnerHTML={{
                                                                __html: event.title.replace(
                                                                    new RegExp(`(${searchTerm})`, 'gi'),
                                                                    '<span class="bg-[#0077FF]/20 text-[#0077FF] rounded px-1">$1</span>'
                                                                ),
                                                            }}
                                                        />
                                                    ) : (
                                                        event.title
                                                    )}
                                                </div>
                                                <div className="text-xs mt-1 text-[#888]">
                                                    <a
                                                        href={event.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-[#0077FF] truncate inline-flex items-center gap-1"
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
                                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                            />
                                                        </svg>
                                                        {event.link}
                                                    </a>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                                                    style={{
                                                        backgroundColor:
                                                            event.category === '예매'
                                                                ? '#0077FF'
                                                                : event.category === '발매'
                                                                  ? '#5eead4'
                                                                  : event.category === '신청'
                                                                    ? '#a78bfa'
                                                                    : event.category === '쿠폰'
                                                                      ? '#fcd34d'
                                                                      : '#555',
                                                        color: 'black',
                                                    }}
                                                >
                                                    {event.category}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="grid gap-1.5">
                                                    {event.companies && Array.isArray(event.companies)
                                                        ? event.companies.map((company, i) => (
                                                              <a
                                                                  key={i}
                                                                  href={company.link}
                                                                  target="_blank"
                                                                  rel="noopener noreferrer"
                                                                  className="text-xs hover:text-[#0077FF] flex items-center gap-1 max-w-[150px]"
                                                              >
                                                                  <svg
                                                                      xmlns="http://www.w3.org/2000/svg"
                                                                      className="h-3 w-3 flex-shrink-0"
                                                                      fill="none"
                                                                      viewBox="0 0 24 24"
                                                                      stroke="currentColor"
                                                                  >
                                                                      <path
                                                                          strokeLinecap="round"
                                                                          strokeLinejoin="round"
                                                                          strokeWidth={2}
                                                                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                                      />
                                                                  </svg>
                                                                  {searchTerm &&
                                                                  company.name
                                                                      .toLowerCase()
                                                                      .includes(searchTerm.toLowerCase()) ? (
                                                                      <span
                                                                          dangerouslySetInnerHTML={{
                                                                              __html: company.name.replace(
                                                                                  new RegExp(`(${searchTerm})`, 'gi'),
                                                                                  '<span class="bg-[#0077FF]/20 text-[#0077FF] rounded px-1">$1</span>'
                                                                              ),
                                                                          }}
                                                                      />
                                                                  ) : (
                                                                      <span className="truncate">{company.name}</span>
                                                                  )}
                                                              </a>
                                                          ))
                                                        : null}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <SecondaryButton
                                                        size="xs"
                                                        onClick={() => handleEditEvent(event)}
                                                        icon={
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
                                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                />
                                                            </svg>
                                                        }
                                                        disabled={isActionInProgress}
                                                    >
                                                        수정
                                                    </SecondaryButton>
                                                    <DangerButton
                                                        size="xs"
                                                        onClick={() => deleteEvent(event.id)}
                                                        icon={
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
                                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                />
                                                            </svg>
                                                        }
                                                        disabled={isActionInProgress}
                                                    >
                                                        삭제
                                                    </DangerButton>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 px-5 text-center">
                            <div className="flex flex-col items-center">
                                {searchTerm ? (
                                    <>
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
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                        <p className="text-[#777] text-base font-medium">
                                            '<span className="text-white">{searchTerm}</span>'에 대한 검색 결과가
                                            없습니다.
                                        </p>
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="mt-3 text-[#0077FF] hover:underline text-sm"
                                        >
                                            검색어 지우기
                                        </button>
                                    </>
                                ) : (
                                    <>
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
                                        <p className="text-[#777] text-base font-medium">
                                            선택한 날짜에 이벤트가 없습니다.
                                        </p>
                                        <button
                                            onClick={openAddModal}
                                            className="mt-3 text-[#0077FF] hover:underline text-sm flex items-center gap-1"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                            새 이벤트 추가하기
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 이벤트 수정 폼 */}
            {activeTab === 'edit' && (
                <form onSubmit={saveEditEvent} className="bg-[#181818]">
                    <CardContent>
                        <CardSection
                            title={`이벤트 ${activeTab === 'edit' ? '수정' : '추가'}`}
                            subtitle={`${selectedDate} - ${activeTab === 'edit' ? '기존 이벤트 정보를 수정합니다.' : '새 이벤트를 추가합니다.'}`}
                            className="bg-[#1a1a1a] p-6 rounded-lg mb-6"
                        >
                            {/* 시간 및 카테고리 */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-[#aaa] mb-1">시간</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 text-[#777]"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            name="time"
                                            type="time"
                                            value={editEvent ? editEvent.time : newEvent.time}
                                            onChange={handleNewEventChange}
                                            className="w-full bg-[#161616] border border-[#333] text-white rounded-md pl-10 pr-3 py-2 focus:ring-2 focus:ring-[#0077FF] focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <SelectField
                                    label="카테고리"
                                    name="category"
                                    value={editEvent ? editEvent.category : newEvent.category}
                                    onChange={handleNewEventChange}
                                    required
                                >
                                    <option value="예매">예매</option>
                                    <option value="발매">발매</option>
                                    <option value="신청">신청</option>
                                    <option value="쿠폰">쿠폰</option>
                                </SelectField>
                            </div>

                            {/* 제목 */}
                            <div className="mt-6 relative">
                                <InputField
                                    label="제목"
                                    name="title"
                                    value={editEvent ? editEvent.title : newEvent.title}
                                    onChange={handleNewEventChange}
                                    required
                                />
                                <div className="absolute left-3.5 top-9 opacity-60 pointer-events-none">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* 링크 */}
                            <div className="mt-6 relative">
                                <InputField
                                    label="링크"
                                    name="link"
                                    value={editEvent ? editEvent.link : newEvent.link}
                                    onChange={handleNewEventChange}
                                    required
                                />
                                <div className="absolute left-3.5 top-9 opacity-60 pointer-events-none">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* 이미지 경로 */}
                            <div className="mt-6 relative">
                                <InputField
                                    label="이미지 경로"
                                    name="img"
                                    value={editEvent ? editEvent.img : newEvent.img}
                                    onChange={handleNewEventChange}
                                    required
                                />
                                <div className="absolute left-3.5 top-9 opacity-60 pointer-events-none">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </CardSection>

                        <CardSection
                            title="회사 정보"
                            subtitle="이벤트와 관련된 회사 정보를 입력합니다."
                            className="bg-[#1a1a1a] p-6 rounded-lg"
                        >
                            <div className="flex justify-end mb-4">
                                <button
                                    type="button"
                                    onClick={addCompany}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-[#222] rounded-md text-sm text-[#0077FF] hover:bg-[#0077FF]/10 transition-colors"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                    </svg>
                                    회사 추가
                                </button>
                            </div>

                            <div className="space-y-4">
                                {(editEvent ? editEvent.companies : newEvent.companies).map((company, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col md:flex-row gap-3 p-4 bg-[#161616] rounded-lg border border-[#333] transition-all duration-200 hover:border-[#444]"
                                    >
                                        <div className="flex-1 relative">
                                            <label
                                                htmlFor={`edit_company_${index}_name`}
                                                className="block text-sm font-medium text-[#aaa] mb-1"
                                            >
                                                회사명
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-[#777]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                        />
                                                    </svg>
                                                </div>
                                                <input
                                                    id={`edit_company_${index}_name`}
                                                    name={`company_${index}_name`}
                                                    value={company.name}
                                                    onChange={handleNewEventChange}
                                                    placeholder="회사명"
                                                    className="w-full bg-[#111] border border-[#333] rounded-md pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 relative">
                                            <label
                                                htmlFor={`edit_company_${index}_link`}
                                                className="block text-sm font-medium text-[#aaa] mb-1"
                                            >
                                                링크
                                            </label>
                                            <div className="relative flex items-center">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-[#777]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                                        />
                                                    </svg>
                                                </div>
                                                <input
                                                    id={`edit_company_${index}_link`}
                                                    name={`company_${index}_link`}
                                                    value={company.link}
                                                    onChange={handleNewEventChange}
                                                    placeholder="https://example.com"
                                                    className="w-full bg-[#111] border border-[#333] rounded-md pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                    required
                                                />
                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCompany(index)}
                                                        className="ml-2 p-2 bg-[#e53e3e]/10 text-[#e53e3e] rounded-md hover:bg-[#e53e3e]/20 focus:outline-none"
                                                        title="회사 삭제"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardSection>
                    </CardContent>

                    <CardFooter className="bg-[#1a1a1a] border-t border-[#292929]">
                        <CardActions>
                            <SecondaryButton
                                type="button"
                                onClick={() => {
                                    if (activeTab === 'edit') {
                                        cancelEdit();
                                    } else {
                                        setActiveTab('list');
                                    }
                                }}
                                icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
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
                                }
                            >
                                취소
                            </SecondaryButton>
                            <PrimaryButton
                                type="submit"
                                disabled={isLoading || isActionInProgress}
                                icon={
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                }
                            >
                                {isLoading || isActionInProgress ? (
                                    <span className="flex items-center gap-2">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        처리 중...
                                    </span>
                                ) : activeTab === 'edit' ? (
                                    '수정 완료'
                                ) : (
                                    '저장하기'
                                )}
                            </PrimaryButton>
                        </CardActions>
                    </CardFooter>
                </form>
            )}

            {/* 이벤트 추가 모달 - 디자인 개선 */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#161616] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto border border-[#292929] animate-fadeIn">
                        <div className="sticky top-0 z-10 p-6 border-b border-[#292929] flex justify-between items-center bg-gradient-to-r from-[#1a1a1a] to-[#242424]">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2 text-[#0077FF]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                새 이벤트 추가
                            </h3>
                            <button
                                onClick={closeAddModal}
                                className="text-[#777] hover:text-white transition-colors p-1 rounded-full hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                aria-label="닫기"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
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

                        <div className="p-6">
                            <form onSubmit={saveNewEvent} className="space-y-6">
                                <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#333]">
                                    <h4 className="text-white font-medium mb-4 flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 mr-2 text-[#0077FF]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        기본 정보
                                    </h4>
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label
                                                    htmlFor="date"
                                                    className="block text-sm font-medium text-[#aaa] mb-1"
                                                >
                                                    날짜 선택
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4 text-[#777]"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <DatePicker
                                                        id="date"
                                                        selected={selectedDate ? new Date(selectedDate) : null}
                                                        onChange={handleDateChange}
                                                        dateFormat="yyyy-MM-dd"
                                                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-md px-3 py-2 pl-9 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                        placeholderText="날짜 선택..."
                                                        locale={ko}
                                                        calendarClassName="bg-[#161616] border border-[#333] rounded-md shadow-lg text-white"
                                                        highlightDates={sortedDates.map((date) => new Date(date))}
                                                        filterDate={(date) => {
                                                            return true; // 새 이벤트 추가에서는 모든 날짜 선택 가능
                                                        }}
                                                        popperProps={{
                                                            strategy: 'fixed',
                                                        }}
                                                        popperPlacement="bottom-start"
                                                        showPopperArrow={false}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="time"
                                                    className="block text-sm font-medium text-[#aaa] mb-1"
                                                >
                                                    시간
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4 text-[#777]"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        id="time"
                                                        name="time"
                                                        type="time"
                                                        value={newEvent.time}
                                                        onChange={handleNewEventChange}
                                                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-md px-3 py-2 pl-9 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="title"
                                                className="block text-sm font-medium text-[#aaa] mb-1"
                                            >
                                                제목
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-[#777]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="title"
                                                    name="title"
                                                    type="text"
                                                    placeholder="이벤트 제목을 입력하세요"
                                                    value={newEvent.title}
                                                    onChange={handleNewEventChange}
                                                    className="w-full bg-[#0d0d0d] border border-[#333] rounded-md px-3 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="link"
                                                className="block text-sm font-medium text-[#aaa] mb-1"
                                            >
                                                링크
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-[#777]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                                        />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="link"
                                                    name="link"
                                                    type="url"
                                                    placeholder="https://example.com"
                                                    value={newEvent.link}
                                                    onChange={handleNewEventChange}
                                                    className="w-full bg-[#0d0d0d] border border-[#333] rounded-md px-3 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="img" className="block text-sm font-medium text-[#aaa] mb-1">
                                                이미지 경로
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-[#777]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="img"
                                                    name="img"
                                                    type="text"
                                                    placeholder="/images/events/event.jpg"
                                                    value={newEvent.img}
                                                    onChange={handleNewEventChange}
                                                    className="w-full bg-[#0d0d0d] border border-[#333] rounded-md px-3 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="category"
                                                className="block text-sm font-medium text-[#aaa] mb-1"
                                            >
                                                카테고리
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-[#777]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                        />
                                                    </svg>
                                                </div>
                                                <select
                                                    id="category"
                                                    name="category"
                                                    value={newEvent.category}
                                                    onChange={handleNewEventChange}
                                                    className="w-full bg-[#0d0d0d] border border-[#333] rounded-md px-3 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF] appearance-none"
                                                    required
                                                >
                                                    <option value="예매">예매</option>
                                                    <option value="발매">발매</option>
                                                    <option value="신청">신청</option>
                                                    <option value="쿠폰">쿠폰</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-[#777]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 9l-7 7-7-7"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#333]">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-white font-medium flex items-center">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 mr-2 text-[#0077FF]"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                />
                                            </svg>
                                            회사 정보
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={addCompany}
                                            className="text-[#0077FF] text-sm hover:text-[#0066DD] flex items-center gap-1 px-2 py-1 rounded hover:bg-[#0077FF]/10 transition-colors"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                            회사 추가
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {newEvent.companies.map((company, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col md:flex-row gap-3 p-4 bg-[#0d0d0d] rounded-lg border border-[#222] transition-all duration-200 hover:border-[#333]"
                                            >
                                                <div className="flex-1 relative">
                                                    <label
                                                        htmlFor={`company_${index}_name`}
                                                        className="block text-sm font-medium text-[#aaa] mb-1"
                                                    >
                                                        회사명
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4 text-[#777]"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            id={`company_${index}_name`}
                                                            name={`company_${index}_name`}
                                                            value={company.name}
                                                            onChange={handleNewEventChange}
                                                            placeholder="회사명"
                                                            className="w-full bg-[#161616] border border-[#333] rounded-md pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex-1 relative">
                                                    <label
                                                        htmlFor={`company_${index}_link`}
                                                        className="block text-sm font-medium text-[#aaa] mb-1"
                                                    >
                                                        링크
                                                    </label>
                                                    <div className="relative flex items-center">
                                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4 text-[#777]"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            id={`company_${index}_link`}
                                                            name={`company_${index}_link`}
                                                            value={company.link}
                                                            onChange={handleNewEventChange}
                                                            placeholder="https://example.com"
                                                            className="w-full bg-[#161616] border border-[#333] rounded-md pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                            required
                                                        />
                                                        {index > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeCompany(index)}
                                                                className="ml-2 p-2 bg-[#e53e3e]/10 text-[#e53e3e] rounded-md hover:bg-[#e53e3e]/20 focus:outline-none"
                                                                title="회사 삭제"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="sticky bottom-0 pt-4 pb-2 flex justify-end gap-3 border-t border-[#292929] bg-[#161616] mt-6">
                                    <button
                                        type="button"
                                        onClick={closeAddModal}
                                        className="px-4 py-2 text-sm bg-[#2c2c2c] text-[#ccc] rounded-md hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-[#444] transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || isActionInProgress}
                                        className="px-4 py-2 text-sm bg-[#0077FF] text-white rounded-md hover:bg-[#0066DD] focus:outline-none focus:ring-2 focus:ring-[#0077FF] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading || isActionInProgress ? (
                                            <>
                                                <svg
                                                    className="animate-spin h-4 w-4 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                저장 중...
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                저장
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* 이벤트 수정 모달 */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-[#161616] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto border border-[#292929] animate-fadeIn">
                        <div className="sticky top-0 z-10 p-6 border-b border-[#292929] flex justify-between items-center bg-gradient-to-r from-[#1a1a1a] to-[#242424]">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2 text-[#0077FF]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                                이벤트 수정
                            </h3>
                            <button
                                onClick={cancelEdit}
                                className="text-[#777] hover:text-white transition-colors p-1 rounded-full hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                aria-label="닫기"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
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

                        <div className="p-6">
                            <form onSubmit={saveEditEvent} className="space-y-6">
                                <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#333]">
                                    <h4 className="text-white font-medium mb-4 flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 mr-2 text-[#0077FF]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        기본 정보
                                    </h4>
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label
                                                    htmlFor="edit_date"
                                                    className="block text-sm font-medium text-[#aaa] mb-1"
                                                >
                                                    날짜 선택
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4 text-[#777]"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <DatePicker
                                                        id="edit_date"
                                                        selected={
                                                            modalSelectedDate ? new Date(modalSelectedDate) : null
                                                        }
                                                        onChange={handleModalDateChange}
                                                        dateFormat="yyyy-MM-dd"
                                                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-md px-3 py-2 pl-9 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                        placeholderText="날짜 선택..."
                                                        locale={ko}
                                                        calendarClassName="bg-[#161616] border border-[#333] rounded-md shadow-lg text-white"
                                                        popperProps={{
                                                            strategy: 'fixed',
                                                        }}
                                                        popperPlacement="bottom-start"
                                                        showPopperArrow={false}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="edit_time"
                                                    className="block text-sm font-medium text-[#aaa] mb-1"
                                                >
                                                    시간
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4 text-[#777]"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <input
                                                        id="edit_time"
                                                        name="time"
                                                        type="time"
                                                        value={editEvent.time}
                                                        onChange={handleNewEventChange}
                                                        className="w-full bg-[#0d0d0d] border border-[#333] rounded-md px-3 py-2 pl-9 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="edit_title"
                                                className="block text-sm font-medium text-[#aaa] mb-1"
                                            >
                                                제목
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-[#777]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="edit_title"
                                                    name="title"
                                                    type="text"
                                                    placeholder="이벤트 제목을 입력하세요"
                                                    value={editEvent.title}
                                                    onChange={handleNewEventChange}
                                                    className="w-full bg-[#0d0d0d] border border-[#333] rounded-md px-3 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="edit_link"
                                                className="block text-sm font-medium text-[#aaa] mb-1"
                                            >
                                                링크
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-[#777]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                                        />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="edit_link"
                                                    name="link"
                                                    type="url"
                                                    placeholder="https://example.com"
                                                    value={editEvent.link}
                                                    onChange={handleNewEventChange}
                                                    className="w-full bg-[#0d0d0d] border border-[#333] rounded-md px-3 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="edit_img"
                                                className="block text-sm font-medium text-[#aaa] mb-1"
                                            >
                                                이미지 경로
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-[#777]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="edit_img"
                                                    name="img"
                                                    type="text"
                                                    placeholder="/images/events/event.jpg"
                                                    value={editEvent.img}
                                                    onChange={handleNewEventChange}
                                                    className="w-full bg-[#0d0d0d] border border-[#333] rounded-md px-3 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="edit_category"
                                                className="block text-sm font-medium text-[#aaa] mb-1"
                                            >
                                                카테고리
                                            </label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-[#777]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                        />
                                                    </svg>
                                                </div>
                                                <select
                                                    id="edit_category"
                                                    name="category"
                                                    value={editEvent.category}
                                                    onChange={handleNewEventChange}
                                                    className="w-full bg-[#0d0d0d] border border-[#333] rounded-md px-3 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF] appearance-none"
                                                    required
                                                >
                                                    <option value="예매">예매</option>
                                                    <option value="발매">발매</option>
                                                    <option value="신청">신청</option>
                                                    <option value="쿠폰">쿠폰</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-[#777]"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 9l-7 7-7-7"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#333]">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-white font-medium flex items-center">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 mr-2 text-[#0077FF]"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                />
                                            </svg>
                                            회사 정보
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={addCompany}
                                            className="text-[#0077FF] text-sm hover:text-[#0066DD] flex items-center gap-1 px-2 py-1 rounded hover:bg-[#0077FF]/10 transition-colors"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 4v16m8-8H4"
                                                />
                                            </svg>
                                            회사 추가
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {editEvent.companies.map((company, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col md:flex-row gap-3 p-4 bg-[#0d0d0d] rounded-lg border border-[#222] transition-all duration-200 hover:border-[#333]"
                                            >
                                                <div className="flex-1 relative">
                                                    <label
                                                        htmlFor={`edit_company_${index}_name`}
                                                        className="block text-sm font-medium text-[#aaa] mb-1"
                                                    >
                                                        회사명
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4 text-[#777]"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            id={`edit_company_${index}_name`}
                                                            name={`company_${index}_name`}
                                                            value={company.name}
                                                            onChange={handleNewEventChange}
                                                            placeholder="회사명"
                                                            className="w-full bg-[#161616] border border-[#333] rounded-md pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex-1 relative">
                                                    <label
                                                        htmlFor={`edit_company_${index}_link`}
                                                        className="block text-sm font-medium text-[#aaa] mb-1"
                                                    >
                                                        링크
                                                    </label>
                                                    <div className="relative flex items-center">
                                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-60 pointer-events-none">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="h-4 w-4 text-[#777]"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                                                />
                                                            </svg>
                                                        </div>
                                                        <input
                                                            id={`edit_company_${index}_link`}
                                                            name={`company_${index}_link`}
                                                            value={company.link}
                                                            onChange={handleNewEventChange}
                                                            placeholder="https://example.com"
                                                            className="w-full bg-[#161616] border border-[#333] rounded-md pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                                                            required
                                                        />
                                                        {index > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeCompany(index)}
                                                                className="ml-2 p-2 bg-[#e53e3e]/10 text-[#e53e3e] rounded-md hover:bg-[#e53e3e]/20 focus:outline-none"
                                                                title="회사 삭제"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="sticky bottom-0 pt-4 pb-2 flex justify-end gap-3 border-t border-[#292929] bg-[#161616] mt-6">
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="px-4 py-2 text-sm bg-[#2c2c2c] text-[#ccc] rounded-md hover:bg-[#333] focus:outline-none focus:ring-2 focus:ring-[#444] transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || isActionInProgress}
                                        className="px-4 py-2 text-sm bg-[#0077FF] text-white rounded-md hover:bg-[#0066DD] focus:outline-none focus:ring-2 focus:ring-[#0077FF] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading || isActionInProgress ? (
                                            <>
                                                <svg
                                                    className="animate-spin h-4 w-4 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                저장 중...
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                수정 완료
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventManager;
