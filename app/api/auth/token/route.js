import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
    const { username } = await request.json();

    if (!username) {
        return NextResponse.json({ message: 'Username is required' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db('user_data');
        const user = await db.collection('users').findOne({ username });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Create JWT payload
        const payload = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            nickname: user.nickname,
        };

        // Generate token with extended expiration time
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1000000000d' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '1000000000d' });

        return NextResponse.json({ accessToken, refreshToken }, { status: 200 });
    } catch (error) {
        console.error('Error generating token:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
