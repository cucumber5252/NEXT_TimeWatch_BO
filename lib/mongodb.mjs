import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import mongodb from 'mongodb';
const { MongoClient } = mongodb;

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!uri) {
    console.error('오류: MONGODB_URI가 환경 변수에 설정되어 있지 않습니다.');
    throw new Error('MongoDB URI가 설정되지 않았습니다. .env.local 파일에 MONGODB_URI를 추가해주세요.');
}

console.log(`MongoDB 연결 시도: ${uri.substring(0, 10)}...`);

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, {
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        global._mongoClientPromise = client
            .connect()
            .then((client) => {
                console.log('MongoDB에 성공적으로 연결되었습니다.');
                return client;
            })
            .catch((err) => {
                console.error('MongoDB 연결 오류:', err);
                throw err;
            });
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, {
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
    });
    clientPromise = client
        .connect()
        .then((client) => {
            console.log('MongoDB에 성공적으로 연결되었습니다.');
            return client;
        })
        .catch((err) => {
            console.error('MongoDB 연결 오류:', err);
            throw err;
        });
}

clientPromise
    .then((client) => {
        const db = client.db('timewatch');
        return db.command({ ping: 1 });
    })
    .then(() => {
        console.log('timewatch 데이터베이스에 연결 확인 완료');
    })
    .catch((err) => {
        console.error('데이터베이스 연결 확인 오류:', err);
    });

export default clientPromise;
