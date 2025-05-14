'use client';

import { useState, Suspense } from 'react';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../find-password/find-password.module.css';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            setErrorMessage('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post('/api/auth/reset-password', {
                token,
                password,
            });
            if (response.status === 200) {
                setSuccessMessage('Password reset successfully.');
                setErrorMessage('');
                router.push('/signin');
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
                setSuccessMessage('');
            } else {
                setErrorMessage('An error occurred. Please try again.');
                setSuccessMessage('');
            }
        }
    };

    return (
        <div className={styles.formContainer}>
            <h1 className={styles.title}>비밀번호 재설정</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formItem}>
                    <label className={styles.label}>새로운 비밀번호</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.formItem}>
                    <label className={styles.label}>비밀번호 확인</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>
                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                <button type="submit" className={styles.button}>
                    확인
                </button>
            </form>
        </div>
    );
};

const ResetPasswordPage = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <ResetPassword />
    </Suspense>
);

export default ResetPasswordPage;
