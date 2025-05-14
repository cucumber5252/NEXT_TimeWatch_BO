import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb.mjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

function normalizeDomain(domain) {
    if (!domain) return '';

    try {
        let normalizedDomain = domain.replace(/^https?:\/\//i, '');
        normalizedDomain = normalizedDomain.replace(/^www\./i, '');
        normalizedDomain = normalizedDomain.split('/')[0];
        normalizedDomain = normalizedDomain.split(':')[0];
        return normalizedDomain.toLowerCase().trim();
    } catch (error) {
        console.error('도메인 정규화 오류:', error);
        return domain;
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        const client = await clientPromise;
        const db = client.db('timewatch');
        const collection = db.collection('mappings');

        const mappings = await collection.find({}).toArray();

        return NextResponse.json(mappings, { status: 200 });
    } catch (error) {
        console.error('매핑 데이터 가져오기 오류:', error);
        return NextResponse.json({ error: '매핑 데이터를 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        const data = await request.json();
        console.log('받은 데이터:', data);

        if (!data.name || !data.domain) {
            return NextResponse.json({ error: '이름과 도메인은 필수 입력 항목입니다.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('timewatch');
        const collection = db.collection('mappings');

        const normalizedDomain = data.normalizedDomain || normalizeDomain(data.domain);

        const existingByNormalized = await collection.findOne({
            $or: [{ normalizedDomain }, { domain: normalizedDomain }],
        });

        if (existingByNormalized) {
            return NextResponse.json(
                {
                    error: '이미 등록된 도메인입니다. (정규화된 도메인 중복)',
                },
                { status: 400 }
            );
        }

        const existingByOriginal = await collection.findOne({ domain: data.domain });
        if (existingByOriginal) {
            return NextResponse.json(
                {
                    error: '이미 등록된 도메인입니다. (원본 도메인 중복)',
                },
                { status: 400 }
            );
        }

        const mappingData = {
            keyword: Array.isArray(data.keyword) ? data.keyword : [],
            domain: data.domain,
            name: data.name,
        };

        console.log('저장할 데이터:', mappingData);
        const result = await collection.insertOne(mappingData);

        return NextResponse.json(
            {
                message: '매핑이 성공적으로 생성되었습니다.',
                id: result.insertedId,
                mapping: mappingData,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('매핑 생성 오류:', error);
        return NextResponse.json({ error: '매핑 생성 중 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        const data = await request.json();
        console.log('수정 요청 데이터:', data);

        if (!data._id || !data.name || !data.domain) {
            return NextResponse.json({ error: '매핑 ID, 이름, 도메인은 필수 입력 항목입니다.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('timewatch');
        const collection = db.collection('mappings');

        const { _id, ...updateData } = data;

        const normalizedDomain = data.normalizedDomain || normalizeDomain(data.domain);

        const mappingData = {
            keyword: Array.isArray(updateData.keyword) ? updateData.keyword : [],
            domain: updateData.domain,
            normalizedDomain,
            originalDomain: updateData.originalDomain || updateData.domain,
            name: updateData.name,
            updatedAt: new Date(),
        };

        const { ObjectId } = require('mongodb');
        const objectId = new ObjectId(_id);

        const existingByNormalized = await collection.findOne({
            _id: { $ne: objectId },
            $or: [{ normalizedDomain }, { domain: normalizedDomain }],
        });

        if (existingByNormalized) {
            return NextResponse.json(
                {
                    error: '이미 다른 매핑에 등록된 도메인입니다. (정규화 도메인 중복)',
                },
                { status: 400 }
            );
        }

        console.log('업데이트할 데이터:', mappingData);
        const result = await collection.updateOne({ _id: objectId }, { $set: mappingData });

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: '해당 ID의 매핑을 찾을 수 없습니다.' }, { status: 404 });
        }

        return NextResponse.json(
            {
                message: '매핑이 성공적으로 업데이트되었습니다.',
                mapping: { _id, ...mappingData },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('매핑 업데이트 오류:', error);
        return NextResponse.json({ error: '매핑 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
        }

        const data = await request.json();

        if (!data._id) {
            return NextResponse.json({ error: '매핑 ID는 필수 입력 항목입니다.' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('timewatch');
        const collection = db.collection('mappings');

        const { ObjectId } = require('mongodb');
        const objectId = new ObjectId(data._id);

        const result = await collection.deleteOne({ _id: objectId });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: '해당 ID의 매핑을 찾을 수 없습니다.' }, { status: 404 });
        }

        return NextResponse.json(
            {
                message: '매핑이 성공적으로 삭제되었습니다.',
                _id: data._id,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('매핑 삭제 오류:', error);
        return NextResponse.json({ error: '매핑 삭제 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
