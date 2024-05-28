"use client";

import { AuthResult } from "@/lib/auth";
import { createContext, useContext } from "react";

const AuthContext = createContext<AuthResult>({
    isAuthenticated: false,
    user: null,
});

type AuthProviderProps = {
    session: AuthResult;
    children: React.ReactNode;
};

export const AuthProvider = ({ session, children }: AuthProviderProps) => {
    return (
        <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
