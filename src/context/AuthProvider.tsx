import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

interface AuthState {
    user?: { id: string; fullName: string; role: string; };
    accessToken?: string;
}

interface AuthContextType {
    auth: AuthState;
    setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [auth, setAuth] = useState<AuthState>({});
    const [isLoading, setIsLoading] = useState(true);

    return (
        <AuthContext.Provider value={{ auth, setAuth, isLoading, setIsLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;