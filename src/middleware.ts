import { App } from "@/server";
import { treaty } from "@elysiajs/eden";
import { NextRequest } from "next/server";

const createMiddlewareClient = (headers: Headers) => {
    return treaty<App>("localhost:3000", {
        headers: headers,
    });
};

export async function middleware(req: NextRequest) {
    const { api } = createMiddlewareClient(new Headers(req.headers));

    const { data, error } = await api.session.get();

    if (error) {
        switch (error.status) {
            default:
                throw error.value;
        }
    }

    if (!data) {
        // TODO: This is where we redirect users for pages that require authentication
    }
}

export const config = {
    matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
