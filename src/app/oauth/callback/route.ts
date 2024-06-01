import { OAuthProvider, oauth } from "@/lib/lucia/oauth";

import { cookies } from "next/headers";
import { getAttributes } from "./../../../lib/lucia/oauth";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedProvider = cookies().get("oauth_provider")
        ?.value as OAuthProvider;
    const storedState = cookies().get("oauth_state")?.value;

    if (
        !code ||
        !state ||
        !storedProvider ||
        !storedState ||
        state !== storedState
    ) {
        return new Response(null, {
            status: 400,
        });
    }

    const provider = oauth[storedProvider];
    const tokens = await provider.validateAuthorizationCode(code);
    const { email } = await getAttributes(storedProvider, tokens.accessToken);

    console.log(email);

    return new Response(null, {
        status: 302,
        headers: {
            Location: "/",
        },
    });
}
