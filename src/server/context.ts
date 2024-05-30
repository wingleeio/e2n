import { client } from "@/lib/database";
import { lucia } from "@/lib/lucia";
import { setSessionCookie } from "@/lib/lucia/set-session-cookie";
import { resend } from "@/lib/resend";
import * as queries from "@/schema/queries";
import Elysia from "elysia";

export const context = new Elysia()
    .decorate({
        client,
        lucia,
        queries,
        resend,
    })
    .derive({ as: "global" }, async ({ lucia, cookie }) => {
        const sessionCookieAttributes = cookie[lucia.sessionCookieName];
        const sessionId = sessionCookieAttributes.value;

        if (!sessionId) {
            return {
                user: null,
            };
        }

        const { session, user } = await lucia.validateSession(sessionId);

        if (session && session.fresh) {
            const sessionCookie = lucia.createSessionCookie(session.id);
            setSessionCookie(sessionCookieAttributes, sessionCookie);
        }

        if (!session) {
            sessionCookieAttributes.remove();
            return {
                user: null,
            };
        }

        return {
            user,
        };
    });
