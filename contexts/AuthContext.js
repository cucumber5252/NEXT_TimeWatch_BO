'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'loading') {
            setLoading(true);
            return;
        }

        setUser(session?.user || null);
        setLoading(false);
    }, [session, status]);

    const value = useMemo(
        () => ({
            user,
            loading,
            isAdmin: user?.role === 'admin',
            isAuthenticated: !!user,
        }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
