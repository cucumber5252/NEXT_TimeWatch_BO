'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import styles from './signin.module.css';
import { useRouter } from 'next/navigation';

export default function SigninForm() {
    const { data: session, status } = useSession();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (status === 'authenticated') {
            // 페이지 URL을 클라이언트 사이드 내비게이션 방식으로 변경
            router.push('/');
        }
    }, [status, router]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsPending(true);

        const result = await signIn('credentials', {
            redirect: false,
            username,
            password,
        });

        setIsPending(false);

        if (result.error) {
            setErrorMessage(result.error);
        } else {
            if (process.env.NODE_ENV === 'development') {
                console.log('Signin result:', result);
            }
            if (result.ok) {
                // Fetch session to get the tokens
                try {
                    const response = await fetch('/api/auth/session');
                    if (!response.ok) {
                        throw new Error('Failed to fetch session data');
                    }
                    const data = await response.json();
                    if (process.env.NODE_ENV === 'development') {
                        console.log('Session data:', data); // Debugging line
                    }

                    const { accessToken, refreshToken } = data;
                    if (accessToken && refreshToken) {
                        try {
                            localStorage.setItem('accessToken', accessToken);
                            localStorage.setItem('refreshToken', refreshToken);
                            if (process.env.NODE_ENV === 'development') {
                                console.log('AccessToken saved:', accessToken);
                                console.log('RefreshToken saved:', refreshToken);
                            }
                            // 클라이언트 사이드 내비게이션으로 URL을 '/'로 변경
                            router.push('/');
                        } catch (error) {
                            console.error('Error saving tokens to localStorage:', error);
                            setErrorMessage('Failed to save tokens to localStorage.');
                        }
                    } else {
                        console.error('Access token or refresh token is missing in the session:', data);
                        setErrorMessage('Signin failed: Access token or refresh token is missing.');
                    }
                } catch (error) {
                    console.error('Error fetching session:', error);
                    setErrorMessage('Signin failed: Unable to fetch session.');
                }
            } else {
                console.error('Signin result is not ok:', result);
                setErrorMessage('Signin failed.');
            }
        }
    };

    if (status === 'authenticated') {
        return (
            <div className={styles.already}>
                <p>로그인 상태입니다.</p>
                <p>아이디: {session.user.username}</p>
                <br />
                <button onClick={() => signOut()} className={styles.underline}>
                    로그아웃
                </button>
            </div>
        );
    }

    return (
        <div className={styles.formContainer}>
            <h1 className={styles.title}>로그인</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label className={styles.label} htmlFor="username">
                        아이디
                    </label>
                    <input
                        className={styles.input}
                        id="username"
                        name="username"
                        type="text"
                        placeholder="아이디를 입력하세요"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label className={styles.label} htmlFor="password">
                        패스워드
                    </label>
                    <input
                        className={styles.input}
                        id="password"
                        name="password"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button className={styles.button} type="submit" disabled={isPending}>
                    로그인
                </button>
                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
            </form>
            <div className={styles.signup}>
                <p>
                    <Link href="/find-password">
                        <span className={styles.underline}>비밀번호 찾기</span>
                    </Link>
                </p>
            </div>
        </div>
    );
}
