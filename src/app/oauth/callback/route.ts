import { client } from "@/lib/database";
import { lucia } from "@/lib/lucia";
import { OAuthProvider, oauth } from "@/lib/lucia/oauth";
import { CreateUserReturns, createOauthAccount, createUser, getOauthAccount } from "@/schema/queries";

import { cookies } from "next/headers";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedProvider = cookies().get("oauth_provider")?.value as OAuthProvider;
    const storedState = cookies().get("oauth_state")?.value;

    if (!code || !state || !storedProvider || !storedState || state !== storedState) {
        return new Response(null, {
            status: 400,
        });
    }

    const provider = oauth[storedProvider];
    const tokens = await provider.client.validateAuthorizationCode(code);
    const { id, email } = await provider.getAttributes(tokens.accessToken);

    if (!email || !id) {
        return new Response(null, {
            status: 400,
        });
    }

    const oAuthAccount = await getOauthAccount(client, {
        provider_user_id: `${storedProvider}:${id}`,
    });

    if (oAuthAccount) {
        const session = await lucia.createSession(oAuthAccount.user_id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

        return new Response(null, {
            status: 302,
            headers: {
                Location: "/",
            },
        });
    }

    let user: CreateUserReturns;

    try {
        user = await createUser(client, {
            email,
            email_verified: true,
        });
        await createOauthAccount(client, {
            provider: storedProvider,
            provider_user_id: `${storedProvider}:${id}`,
            user_id: user.id,
        });
    } catch (e) {
        return new Response(null, {
            status: 400,
        });
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return new Response(null, {
        status: 302,
        headers: {
            Location: "/",
        },
    });
}
