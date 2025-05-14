// 여기 터미널에서 사용자 아이디 검색해보는 api입니다

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkUser(userId) {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('MongoDB에 연결되었습니다.');

        const database = client.db('timewatch');
        const usersCollection = database.collection('users');

        const query = { username: userId };
        const user = await usersCollection.findOne(query);

        if (user) {
            console.log('사용자를 찾았습니다:');
            console.log(`ID: ${user.username}`);
            console.log(`이메일: ${user.email}`);
            console.log(`가입일: ${user.createdAt}`);
            console.log(`권한: ${user.role || '일반 사용자'}`);
        } else {
            console.log(`사용자 '${userId}'를 찾을 수 없습니다.`);
        }
    } catch (error) {
        console.error('오류 발생:', error);
    } finally {
        await client.close();
        console.log('MongoDB 연결이 닫혔습니다.');
    }
}

// 명령줄 인자로 사용자 ID 받기
const userId = process.argv[2];

if (!userId) {
    console.log('사용법: node checkuser.js <사용자ID>');
} else {
    checkUser(userId);
}
