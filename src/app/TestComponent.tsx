"use client";

import { ClientSignedIn } from "@/components/client-signed-in";
import { ClientSignedOut } from "@/components/client-signed-out";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export const TestComponent = () => {
    const router = useRouter();
    return (
        <div className="p-4 flex flex-col gap-4">
            <h1>Hello, world!</h1>
            <p>
                <ClientSignedIn>
                    {(user) => <>Welcome, {user.id}!</>}
                </ClientSignedIn>
                <ClientSignedOut>You are not logged in!</ClientSignedOut>
            </p>
            <div className="flex gap-4">
                <ClientSignedIn>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={async () => {
                            await api.auth.logout.post();
                            router.refresh();
                        }}
                    >
                        Logout
                    </button>
                </ClientSignedIn>
                <ClientSignedOut>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={async () => {
                            await api.auth.signin.post({
                                email: "test@test.com",
                                password: "@Testing1",
                            });
                            router.refresh();
                        }}
                    >
                        Sign In
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={async () => {
                            await api.auth.join.post({
                                email: "test@test.com",
                                password: "@Testing1",
                            });
                            router.refresh();
                        }}
                    >
                        Join
                    </button>
                </ClientSignedOut>
            </div>
        </div>
    );
};
