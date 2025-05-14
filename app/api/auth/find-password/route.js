import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, email } = body;

        if (!username || !email) {
            return NextResponse.json({ message: 'Username and email are required' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('user_data');

        const user = await db.collection('users').findOne({ username, email });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Generate a password reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Save the reset token and its expiration time in the database
        await db.collection('users').updateOne(
            { _id: new ObjectId(user._id) },
            {
                $set: {
                    resetToken,
                    resetTokenExpiration: Date.now() + 3600000, // 1 hour expiration
                },
            }
        );

        return NextResponse.json({ resetToken }, { status: 200 });
    } catch (error) {
        console.error('Error in password reset:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
