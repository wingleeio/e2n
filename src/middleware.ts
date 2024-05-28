import { AUTH_HEADER } from "@/lib/constants";
import { App } from "@/server";
import { treaty } from "@elysiajs/eden";
import { NextRequest, NextResponse } from "next/server";

const createMiddlewareClient = (headers: Headers) => {
    return treaty<App>("localhost:3000", {
        headers: headers,
    });
};

const createRouteMatcher = (patterns: string[]) => {
    const regexes = patterns.map((pattern) => new RegExp(`^${pattern}$`));

    return (req: NextRequest) => {
        const pathname = req.nextUrl.pathname;
        return regexes.some((regex) => regex.test(pathname));
    };
};

const isProtectedRoute = createRouteMatcher([]);

export async function middleware(req: NextRequest) {
    const headers = new Headers(req.headers);

    const { api } = createMiddlewareClient(headers);

    const { data } = await api.session.get();

    if (isProtectedRoute(req) && !data) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (data) {
        headers.set(AUTH_HEADER, JSON.stringify(data));
    }

    return NextResponse.next({
        request: {
            headers,
        },
    });
}

export const config = {
    matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
