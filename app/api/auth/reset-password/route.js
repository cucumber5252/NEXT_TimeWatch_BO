import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';

export async function POST(request) {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
        return NextResponse.json({ message: 'Token and password are required' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db('user_data');

        const user = await db.collection('users').findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.collection('users').updateOne(
            { _id: new ObjectId(user._id) },
            {
                $set: { password: hashedPassword },
                $unset: { resetToken: '', resetTokenExpiration: '' },
            }
        );

        return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error in password reset:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
