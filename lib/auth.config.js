import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import clientPromise from '@/mongodb';

const authorizeUser = async (credentials) => {
    const { username, password } = credentials;
    try {
        const client = await clientPromise;
        const db = client.db('user_data');
        const users = db.collection('users');

        const user = await users.findOne({ username });
        if (!user) {
            throw new Error('Invalid username or password');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error('Invalid username or password');
        }

        return {
            id: user._id.toString(), // Ensure ID is a string
            username: user.username,
            email: user.email,
            nickname: user.nickname,
            role: user.role,
        };
    } catch (error) {
        console.error('Error during sign in:', error);
        throw new Error(error.message);
    }
};

const authConfig = {
    providers: [
        CredentialsProvider({
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
    },
};

export default authConfig;
