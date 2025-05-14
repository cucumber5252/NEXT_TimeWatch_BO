import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from '../../../../lib/mongodb.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const authorizeUser = async (credentials) => {
    const { username, password } = credentials;
    try {
        const client = await clientPromise;
        const db = client.db('user_data');
        const users = db.collection('users');

        const user = await users.findOne({ username });
        if (!user) {
            throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
        }

        const payload = { id: user._id.toString(), username: user.username, name: user.nickname };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1000000000d' });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '1000000000d' });

        return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            nickname: user.nickname,
            role: user.role,
            accessToken,
            refreshToken,
        };
    } catch (error) {
        console.error('Error during sign in:', error);
        throw error;
    }
};

export const authOptions = {
    providers: [
        // 기존 pages에서는 CredentialsProvider.default({...})를 사용했으므로
        CredentialsProvider.default({
            name: 'Credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: authorizeUser,
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = user.username;
                token.email = user.email;
                token.nickname = user.nickname;
                token.role = user.role;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
            } else if (token.id) {
                const client = await clientPromise;
                const db = client.db('user_data');
                const dbUser = await db.collection('users').findOne({ _id: new ObjectId(token.id) });
                if (dbUser) {
                    token.username = dbUser.username;
                    token.email = dbUser.email;
                    token.nickname = dbUser.nickname;
                    token.role = dbUser.role;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.id,
                    username: token.username,
                    email: token.email,
                    nickname: token.nickname,
                    role: token.role,
                };
                session.accessToken = token.accessToken;
                session.refreshToken = token.refreshToken;
            }
            return session;
        },
    },
    pages: {
        signIn: '/signin',
        error: '/signin',
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    debug: process.env.NODE_ENV === 'development',
};

// 마찬가지로 NextAuth도 .default를 사용합니다.
const handler = NextAuth.default(authOptions);
export { handler as GET, handler as POST };
