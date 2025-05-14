import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb.mjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

// 특정 날짜의 이벤트 가져오기
export async function GET(request) {
    try {
        console.log('GET /api/admin/events/by-date 요청 시작');

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

        console.log(`날짜 ${date}의 이벤트 조회 중`);

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
