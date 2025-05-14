import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request) {
    const { username, password } = await request.json();

    try {
        const client = await clientPromise;
        const db = client.db('user_data');
        const users = db.collection('users');

        const user = await users.findOne({ username });
        if (!user) {
            return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 });
        }

        const payload = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            nickname: user.nickname,
        };

        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1000000000d',
        });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: '1000000000d',
        });

        return NextResponse.json(
            {
                accessToken,
                refreshToken,
                user: {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                    nickname: user.nickname,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error logging in:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
