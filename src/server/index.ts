import * as queries from "@/db/queries";
import { client } from "@/lib/edgedb";
import { lucia } from "@/lib/lucia";
import { setSessionCookie } from "@/lib/lucia/set-session-cookie";
import { Elysia, t } from "elysia";

export const app = new Elysia({ prefix: "/api" })
    .decorate({
        client,
        lucia,
    })
    .get(
        "/session",
        async ({ lucia, cookie }) => {
            const sessionCookieAttributes = cookie[lucia.sessionCookieName];
            const sessionId = sessionCookieAttributes.value;

            if (!sessionId) {
                return null;
            }

            const { session, user } = await lucia.validateSession(sessionId);

            if (session && session.fresh) {
                const sessionCookie = lucia.createSessionCookie(session.id);
                setSessionCookie(sessionCookieAttributes, sessionCookie);
            }

            if (!session) {
                sessionCookieAttributes.remove();
                return null;
            }

            return user;
        },
        {
            response: t.Union([
                t.Null(),
                t.Object({
                    id: t.String(),
                }),
            ]),
        }
    )
    .post("/login", async ({ client, lucia, cookie }) => {
        const user = await queries.createUser(client);
        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        const sessionCookieAttributes = cookie[sessionCookie.name];

        setSessionCookie(sessionCookieAttributes, sessionCookie);

        return null;
    })
    .post("/logout", async ({ lucia, cookie }) => {
        const sessionCookieAttributes = cookie[lucia.sessionCookieName];
        const sessionId = sessionCookieAttributes.value;

        const { session } = await lucia.validateSession(sessionId);

        if (session) {
            sessionCookieAttributes.remove();
            await lucia.invalidateSession(session.id);
        }

        return null;
    });

export type App = typeof app;
