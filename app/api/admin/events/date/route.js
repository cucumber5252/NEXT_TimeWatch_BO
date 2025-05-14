import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb.mjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

// 새 날짜 추가하기 (MongoDB에서는 필요 없지만 API 호환성을 위해 유지)
export async function POST(request) {
    try {
        console.log('POST /api/admin/events/date 요청 시작');

        // 개발 환경에서 인증 생략
        if (process.env.NODE_ENV !== 'development') {
            const session = await getServerSession(authOptions);
            if (!session || session.user.role !== 'admin') {
                return NextResponse.json({ success: false, message: '관리자 권한이 필요합니다.' }, { status: 401 });
            }
        }

        const { date } = await request.json();

        // 날짜 형식 검증
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return NextResponse.json(
                { success: false, message: '날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식으로 입력하세요.' },
                { status: 400 }
            );
        }

        // MongoDB 클라이언트 연결
        const client = await clientPromise;
        const db = client.db('timewatch');
        const collection = db.collection('events');

        // 이미 해당 날짜의 이벤트가 있는지 확인
        const existingEvent = await collection.findOne({ date });
        if (existingEvent) {
            return NextResponse.json(
                {
                    success: false,
                    message: '해당 날짜가 이미 존재합니다.',
                },
                { status: 400 }
            );
        }

        // MongoDB는 문서 기반이므로 미리 날짜를 생성할 필요 없이
        // 해당 날짜를 사용하는 첫 번째 이벤트가 저장될 때 자동으로 생성됨
        return NextResponse.json({
            success: true,
            message: '날짜가 추가되었습니다.',
        });
    } catch (error) {
        console.error('날짜 추가 오류:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}

// 특정 날짜의 이벤트 가져오기
export async function GET(request) {
    try {
        console.log('GET /api/admin/events/date 요청 시작');

        // 개발 환경에서 인증 생략
        if (process.env.NODE_ENV !== 'development') {
            const session = await getServerSession(authOptions);
            if (!session || session.user.role !== 'admin') {
                return NextResponse.json({ success: false, message: '관리자 권한이 필요합니다.' }, { status: 401 });
            }
        }

        // URL에서 날짜 파라미터 추출
        const url = new URL(request.url);
        const date = url.searchParams.get('date');

        if (!date) {
            return NextResponse.json(
                {
                    success: false,
                    message: '날짜 파라미터가 필요합니다.',
                },
                { status: 400 }
            );
        }

        // MongoDB 클라이언트 연결
        const client = await clientPromise;
        const db = client.db('timewatch');
        const collection = db.collection('events');

        // 해당 날짜의 이벤트 조회
        const events = await collection.find({ date }).sort({ time: 1 }).toArray();
        console.log(`날짜 ${date}의 이벤트 ${events.length}개 조회됨`);

        // 이벤트를 클라이언트 포맷으로 변환
        const formattedEvents = events.map((event) => ({
            id: event.eventId,
            time: event.time,
            title: event.title,
            link: event.link,
            img: event.img,
            companies: event.companies || [],
            category: event.category || '예매',
        }));

        return NextResponse.json({
            success: true,
            date,
            events: formattedEvents,
        });
    } catch (error) {
        console.error('날짜별 이벤트 조회 오류:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}
