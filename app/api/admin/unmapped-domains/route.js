import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb.mjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

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

/**
 * URL에서 도메인 추출 함수
 * @param {string} url URL 문자열
 * @returns {string} 추출된 도메인
 */
function extractDomainFromUrl(url) {
    if (!url) return '';

    try {
        // URL 객체 생성
        let urlObj;
        try {
            urlObj = new URL(url);
        } catch (e) {
            // URL 형식이 아닌 경우 http:// 추가 시도
            if (!url.match(/^https?:\/\//i)) {
                try {
                    urlObj = new URL(`http://${url}`);
                } catch (e2) {
                    return url; // URL 파싱 실패시 원본 반환
                }
            } else {
                return url; // URL 파싱 실패시 원본 반환
            }
        }

        return urlObj.hostname;
    } catch (error) {
        console.error('URL에서 도메인 추출 오류:', error);
        return url; // 오류 발생 시 원본 반환
    }
}

/**
 * 매핑되지 않은 도메인 목록을 조회하는 API
 * GET 요청 파라미터:
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 한 페이지당 항목 수 (기본값: 20)
 * - sort: 정렬 기준 (visits: 방문횟수, recent: 최근방문, domain: 도메인명)
 * - order: 정렬 순서 (desc, asc)
 */
export async function GET(request) {
    try {
        // 관리자 권한 확인
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        // URL 검색 파라미터 추출
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const sort = searchParams.get('sort') || 'visits'; // 기본 정렬은 방문 횟수
        const order = searchParams.get('order') || 'desc'; // 기본 내림차순
        const search = searchParams.get('search') || ''; // 검색어

        // 페이지네이션 및 정렬을 위한 값 설정
        const skip = (page - 1) * limit;

        // MongoDB 연결
        const client = await clientPromise;
        const servertimeDb = client.db('servertime');
        const mappingDb = client.db('mappingdata');

        console.log('DB 연결 성공');

        // 1. 매핑된 도메인 목록(정규화) 가져오기
        const mappedDomains = await mappingDb.collection('websitemappings').find({}).toArray();
        const mappedSet = new Set(mappedDomains.map((d) => normalizeDomain(d.domain)));

        // 2. 미매핑 후보 추출 (url과 pageName이 같은 레코드)
        let matchCondition = { $expr: { $eq: ['$url', '$pageName'] } };
        if (search) {
            matchCondition.url = { $regex: search, $options: 'i' };
        }
        const unmappedRaw = await servertimeDb.collection('urlVisits').find(matchCondition).toArray();

        // 3. 도메인별 그룹핑 및 visitCount, lastVisit, urls 합산
        const domainMap = new Map();
        for (const doc of unmappedRaw) {
            const domain = extractDomainFromUrl(doc.url);
            const normalized = normalizeDomain(domain);
            if (mappedSet.has(normalized)) continue; // 이미 매핑된 도메인은 제외
            if (!normalized) continue;

            if (!domainMap.has(normalized)) {
                domainMap.set(normalized, {
                    domain,
                    normalizedDomain: normalized,
                    visitCount: 1,
                    lastVisit: doc.visitedAt || null,
                    urls: [doc.url],
                    originalUrl: doc.url,
                });
            } else {
                const info = domainMap.get(normalized);
                info.visitCount += 1;
                if (!info.lastVisit || (doc.visitedAt && doc.visitedAt > info.lastVisit)) {
                    info.lastVisit = doc.visitedAt;
                }
                if (!info.urls.includes(doc.url)) info.urls.push(doc.url);
            }
        }

        let unmappedDomains = Array.from(domainMap.values());

        // 4. 정렬
        let sortField, sortOrder;
        switch (sort) {
            case 'visits':
                sortField = 'visitCount';
                break;
            case 'recent':
                sortField = 'lastVisit';
                break;
            case 'domain':
                sortField = 'domain';
                break;
            default:
                sortField = 'visitCount';
        }
        sortOrder = order === 'asc' ? 1 : -1;
        unmappedDomains.sort((a, b) => {
            const aValue = a[sortField] || 0;
            const bValue = b[sortField] || 0;
            if (sortField === 'lastVisit') {
                return (new Date(aValue) > new Date(bValue) ? 1 : -1) * sortOrder;
            }
            return (aValue > bValue ? 1 : -1) * sortOrder;
        });

        // 5. 페이지네이션
        const total = unmappedDomains.length;
        const paginatedData = unmappedDomains.slice(skip, skip + limit);

        return NextResponse.json(
            {
                domains: paginatedData,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('미매핑 도메인 조회 오류:', error);
        return NextResponse.json({ error: '미매핑 도메인을 조회하는 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
