import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Event from '../../../../models/Event';
import clientPromise from '../../../../lib/mongodb.mjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// 이벤트 목록 가져오기 (MongoDB에서 직접 가져옴)
export async function GET(request) {
    try {
        console.log('GET /api/admin/events 요청 시작');

        // 개발 환경에서 인증 생략
        if (process.env.NODE_ENV !== 'development') {
            const session = await getServerSession(authOptions);
            if (!session || session.user.role !== 'admin') {
                return NextResponse.json({ success: false, message: '관리자 권한이 필요합니다.' }, { status: 401 });
            }
        }

        // MongoDB 클라이언트 연결
        const client = await clientPromise;
        const db = client.db('timewatch');
        const collection = db.collection('events');

        console.log('MongoDB events 컬렉션 접근');

        // 쿼리 파라미터 확인
        const url = new URL(request.url);
        const date = url.searchParams.get('date');

        // 이벤트 조회
        let filter = {};
        if (date) {
            filter.date = date;
        }

        console.log('이벤트 조회 쿼리:', filter);

        // 모든 이벤트 가져오기
        const events = await collection.find(filter).sort({ date: -1, time: 1 }).toArray();
        console.log(`이벤트 조회 완료: ${events.length}개 결과`);

        // 날짜별로 그룹화
        const groupedEvents = {};

        for (const event of events) {
            const date = event.date;

            if (!groupedEvents[date]) {
                groupedEvents[date] = [];
            }

            groupedEvents[date].push({
                id: event.eventId,
                time: event.time,
                title: event.title,
                link: event.link,
                img: event.img,
                category: event.category || '예매', // 카테고리가 없는 경우 기본값
                companies: event.companies || [], // companies가 없는 경우 빈 배열
            });
        }

        console.log(`응답: ${Object.keys(groupedEvents).length}개 날짜의 이벤트`);

        return NextResponse.json({
            success: true,
            data: groupedEvents,
        });
    } catch (error) {
        console.error('이벤트 조회 오류:', error);
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

// 새 이벤트 추가하기
export async function POST(request) {
    try {
        console.log('POST /api/admin/events 요청 시작');

        // 개발 환경에서 인증 생략
        if (process.env.NODE_ENV !== 'development') {
            const session = await getServerSession(authOptions);
            if (!session || session.user.role !== 'admin') {
                return NextResponse.json({ success: false, message: '관리자 권한이 필요합니다.' }, { status: 401 });
            }
        }

        // 요청 본문 파싱
        const { date, event } = await request.json();

        if (!date || !event) {
            return NextResponse.json({ success: false, message: '날짜와 이벤트 정보가 필요합니다.' }, { status: 400 });
        }

        // MongoDB 클라이언트 연결
        const client = await clientPromise;
        const db = client.db('timewatch');
        const collection = db.collection('events');

        // 새 이벤트 ID 생성
        let eventId = event.id;
        if (!eventId) {
            const highestEvent = await collection.find().sort({ eventId: -1 }).limit(1).toArray();
            eventId = highestEvent.length > 0 ? highestEvent[0].eventId + 1 : 1;
        }

        // 새 이벤트 문서 생성
        const newEvent = {
            eventId: eventId,
            date: date,
            time: event.time,
            title: event.title,
            link: event.link,
            img: event.img,
            companies: event.companies,
            category: event.category,
            createdAt: new Date(),
        };

        // 이벤트 저장
        await collection.insertOne(newEvent);

        return NextResponse.json({
            success: true,
            message: '이벤트가 성공적으로 추가되었습니다.',
            event: newEvent,
        });
    } catch (error) {
        console.error('이벤트 추가 오류:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// 이벤트 삭제하기
export async function DELETE(request) {
    try {
        console.log('DELETE /api/admin/events 요청 시작');

        // 개발 환경에서 인증 생략
        if (process.env.NODE_ENV !== 'development') {
            const session = await getServerSession(authOptions);
            if (!session || session.user.role !== 'admin') {
                return NextResponse.json({ success: false, message: '관리자 권한이 필요합니다.' }, { status: 401 });
            }
        }

        // 요청 본문 파싱
        const { date, eventId } = await request.json();

        if (!date || !eventId) {
            return NextResponse.json({ success: false, message: '날짜와 이벤트 ID가 필요합니다.' }, { status: 400 });
        }

        // MongoDB 클라이언트 연결
        const client = await clientPromise;
        const db = client.db('timewatch');
        const collection = db.collection('events');

        // 이벤트 삭제
        const result = await collection.deleteOne({ date, eventId: Number(eventId) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, message: '해당 이벤트를 찾을 수 없습니다.' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: '이벤트가 성공적으로 삭제되었습니다.',
        });
    } catch (error) {
        console.error('이벤트 삭제 오류:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// 이벤트 수정하기
export async function PUT(request) {
    try {
        console.log('PUT /api/admin/events 요청 시작');

        // 개발 환경에서 인증 생략
        if (process.env.NODE_ENV !== 'development') {
            const session = await getServerSession(authOptions);
            if (!session || session.user.role !== 'admin') {
                return NextResponse.json({ success: false, message: '관리자 권한이 필요합니다.' }, { status: 401 });
            }
        }

        // 요청 본문 파싱
        const { date, event, oldDate } = await request.json();
        console.log('PUT 요청 데이터:', { date, event, oldDate });

        if (!event || !event.id) {
            return NextResponse.json({ success: false, message: '이벤트 정보와 ID가 필요합니다.' }, { status: 400 });
        }

        if (!oldDate) {
            return NextResponse.json(
                { success: false, message: '기존 이벤트 날짜(oldDate)가 필요합니다.' },
                { status: 400 }
            );
        }

        // MongoDB 클라이언트 연결
        const client = await clientPromise;
        const db = client.db('timewatch');
        const collection = db.collection('events');

        // 디버깅: 해당 이벤트가 존재하는지 먼저 확인
        const eventId = Number(event.id);
        console.log('이벤트 ID:', eventId, '타입:', typeof eventId);

        // 정확히 일치하는 이벤트 찾기 (oldDate와 eventId로 검색)
        const existingEvent = await collection.findOne({
            date: oldDate,
            eventId: eventId,
        });
        console.log('기존 이벤트 조회 결과:', existingEvent);

        // 이벤트를 찾을 수 없는 경우
        if (!existingEvent) {
            console.log('이벤트를 찾을 수 없음. 검색 조건:', { oldDate, eventId });

            // ID로만 다시 찾아보기 (날짜가 잘못된 경우 대비)
            const eventById = await collection.findOne({ eventId: eventId });
            console.log('ID로만 다시 찾은 결과:', eventById);

            if (!eventById) {
                return NextResponse.json(
                    {
                        success: false,
                        message: '해당 이벤트를 찾을 수 없습니다. ID: ' + eventId,
                    },
                    { status: 404 }
                );
            }

            // 이벤트가 존재하지만 다른 날짜에 있는 경우 (이 경우도 처리)
            console.log('이벤트가 다른 날짜에 존재:', eventById.date);

            // 이 경우에도 기존의 oldDate를 사용해 삭제를 시도
            console.log('oldDate를 사용하여 삭제 시도:', oldDate);
            const deleteResult = await collection.deleteOne({
                date: oldDate,
                eventId: eventId,
            });

            // 삭제에 실패한 경우, 실제 존재하는 날짜로 다시 시도
            if (deleteResult.deletedCount === 0) {
                console.log('oldDate로 삭제 실패, 실제 날짜로 재시도:', eventById.date);
                await collection.deleteOne({
                    date: eventById.date,
                    eventId: eventId,
                });
            }

            // 새 이벤트 생성
            const newEvent = {
                eventId: eventId,
                date: date,
                time: event.time,
                title: event.title,
                link: event.link,
                img: event.img,
                companies: event.companies,
                category: event.category,
                updatedAt: new Date(),
            };

            console.log('새 날짜에 이벤트 추가:', newEvent);
            await collection.insertOne(newEvent);

            return NextResponse.json({
                success: true,
                message: '이벤트가 새 날짜로 이동되었습니다.',
                event: newEvent,
            });
        }

        // 날짜가 변경된 경우
        if (oldDate !== date) {
            // 기존 이벤트 삭제
            console.log('날짜 변경 감지, 기존 이벤트 삭제:', { oldDate, eventId: eventId });
            const deleteResult = await collection.deleteOne({ date: oldDate, eventId: eventId });

            if (deleteResult.deletedCount === 0) {
                console.log('삭제 실패, 다른 방법으로 재시도');
                // 모든 이벤트에서 eventId로 검색하여 삭제
                await collection.deleteOne({ eventId: eventId });
            }

            // 새 이벤트 추가
            const newEvent = {
                eventId: eventId,
                date: date,
                time: event.time,
                title: event.title,
                link: event.link,
                img: event.img,
                companies: event.companies,
                category: event.category,
                updatedAt: new Date(),
            };

            console.log('새 날짜에 이벤트 추가:', newEvent);
            await collection.insertOne(newEvent);

            return NextResponse.json({
                success: true,
                message: '이벤트가 성공적으로 이동되었습니다.',
                event: newEvent,
            });
        } else {
            // 같은 날짜 내에서 이벤트 수정
            console.log('동일 날짜 내 이벤트 수정:', { date, eventId: eventId });
            const updatedEvent = await collection.findOneAndUpdate(
                { date, eventId: eventId },
                {
                    $set: {
                        time: event.time,
                        title: event.title,
                        link: event.link,
                        img: event.img,
                        companies: event.companies,
                        category: event.category,
                        updatedAt: new Date(),
                    },
                },
                { returnDocument: 'after' }
            );

            console.log('업데이트 결과:', updatedEvent);

            // MongoDB 버전에 따라 결과 구조가 다를 수 있음
            // value 또는 document 필드 확인
            const result = updatedEvent.value || updatedEvent;

            if (!result) {
                return NextResponse.json(
                    { success: false, message: '해당 이벤트를 찾을 수 없습니다.' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                message: '이벤트가 성공적으로 수정되었습니다.',
                event: result,
            });
        }
    } catch (error) {
        console.error('이벤트 수정 오류:', error);
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
