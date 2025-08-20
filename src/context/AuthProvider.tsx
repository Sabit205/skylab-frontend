import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

// A unified UserState that can represent a regular user or a guardian
interface UserState {
    id?: string;
    fullName?: string;
    role?: string;
    studentId?: string; // For guardians
    studentName?: string; // For guardians
}

interface AuthState {
    user?: UserState;
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
    // This state is critical. It's true by default.
    const [isLoading, setIsLoading] = useState(true);

    return (
        <AuthContext.Provider value={{ auth, setAuth, isLoading, setIsLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;