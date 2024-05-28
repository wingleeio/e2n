"use client";

import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export const TestComponent = () => {
    const router = useRouter();
    const session = useAuth();
    return (
        <div>
            <h1>Hello, world!</h1>
            <p>
                {session.isAuthenticated
                    ? `Welcome, ${session.user.id}!`
                    : "You are not logged in."}
            </p>
            {session.isAuthenticated ? (
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={async () => {
                        await api.logout.post();
                        router.refresh();
                    }}
                >
                    Logout
                </button>
            ) : (
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={async () => {
                        await api.login.post();
                        router.refresh();
                    }}
                >
                    Login
                </button>
            )}
        </div>
    );
};
