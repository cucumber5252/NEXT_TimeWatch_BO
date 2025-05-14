'use client';

import { useState } from 'react';
import axios from 'axios';
import styles from './find-password.module.css';
import { useRouter } from 'next/navigation';

const FindPassword = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !email) {
            setErrorMessage('Username and email are required');
            return;
        }

        try {
            const response = await axios.post('/api/auth/find-password', {
                username,
                email,
            });
            if (response.status === 200) {
                setSuccessMessage('You can now reset your password.');
                setErrorMessage('');
                // Redirect to reset password page with the token
                router.push(`/reset-password?token=${response.data.resetToken}`);
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
            <h1 className={styles.title}>비밀번호 찾기</h1>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formItem}>
                    <label className={styles.label}>아이디</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>
                <div className={styles.formItem}>
                    <label className={styles.label}>이메일</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>
                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                <button type="submit" className={styles.button}>
                    비밀번호 재설정하기
                </button>
            </form>
        </div>
    );
};

export default FindPassword;
