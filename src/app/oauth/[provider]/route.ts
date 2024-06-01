import { OAuthProvider, oauth } from "@/lib/lucia/oauth";

import { generateState } from "arctic";
import { cookies } from "next/headers";

type RouteConfig = {
    params: {
        provider: OAuthProvider;
    };
};

export async function GET(_: Request, { params }: RouteConfig): Promise<Response> {
    const state = generateState();
    const provider = oauth[params.provider];
    const url = await provider.client.createAuthorizationURL(state);

    cookies().set("oauth_provider", params.provider, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax",
    });

    cookies().set("oauth_state", state, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 60 * 10,
        sameSite: "lax",
    });

    return Response.redirect(url);
}
