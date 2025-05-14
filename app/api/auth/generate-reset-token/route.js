import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import crypto from 'crypto';

export async function POST(request) {
    const body = await request.json();
    const { email, username } = body;

    try {
        const client = await clientPromise;
        const db = client.db('user_data');
        const user = await db.collection('users').findOne({ email, username });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Generate password reset token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Save the reset token and expiration time in the database (1 hour expiration)
        await db
            .collection('users')
            .updateOne({ email }, { $set: { resetToken, resetTokenExpiration: Date.now() + 3600000 } });

        return NextResponse.json({ resetToken }, { status: 200 });
    } catch (error) {
        console.error('Error generating reset token:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
