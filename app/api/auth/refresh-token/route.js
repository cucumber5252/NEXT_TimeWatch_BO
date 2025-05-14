import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
        return NextResponse.json({ message: 'Refresh token is required' }, { status: 400 });
    }

    try {
        console.log('Verifying refresh token...');
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        console.log('Decoded Token:', decoded);

        const client = await clientPromise;
        const db = client.db('user_data');
        const user = await db.collection('users').findOne({
            _id: new ObjectId(decoded.id),
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        console.log('Generating new access token...');
        const newAccessToken = jwt.sign(
            {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                nickname: user.nickname,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1000000000d' }
        );

        console.log('New access token generated:', newAccessToken);
        return NextResponse.json({ accessToken: newAccessToken }, { status: 200 });
    } catch (error) {
        console.error('Error refreshing token:', error);
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        } else if (error.name === 'TokenExpiredError') {
            return NextResponse.json({ message: 'Token expired' }, { status: 401 });
        } else {
            return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        }
    }
}
