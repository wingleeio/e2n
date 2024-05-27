"use client";

import { api } from "@/client";

export const TestComponent = () => {
    return (
        <div>
            <h1>Hello, world!</h1>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => {
                    api.ping.post();
                }}
            >
                Test
            </button>
        </div>
    );
};
