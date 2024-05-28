import { client } from "@/lib/database";
import { lucia } from "@/lib/lucia";
import { setSessionCookie } from "@/lib/lucia/set-session-cookie";
import * as queries from "@/schema/queries";
import { hash, verify } from "@node-rs/argon2";
import { Elysia, t } from "elysia";

export const app = new Elysia({ prefix: "/api" })
    .decorate({
        client,
        lucia,
    })
    .derive(async ({ lucia, cookie }) => {
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
    })
    .get(
        "/auth/session",
        async ({ user }) => {
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
    .post(
        "/auth/signin",
        async ({ client, lucia, cookie, body }) => {
            const user = await queries.getUserWithHashedPassword(client, {
                email: body.email,
            });

            if (!user) {
                throw new Error("Invalid email or password.");
            }

            const verified = await verify(user.hashed_password, body.password, {
                memoryCost: 19456,
                timeCost: 2,
                outputLen: 32,
                parallelism: 1,
            });

            if (!verified) {
                throw new Error("Invalid email or password.");
            }

            const session = await lucia.createSession(user.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            const sessionCookieAttributes = cookie[sessionCookie.name];

            setSessionCookie(sessionCookieAttributes, sessionCookie);

            return null;
        },
        {
            body: t.Object({
                email: t.String({ format: "email", error: "Invalid email." }),
                password: t.String({
                    minLength: 8,
                    pattern: '(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*',
                    error: "Password must be at least 8 characters long and contain at least one uppercase letter and one special character.",
                }),
            }),
            response: t.Null(),
        }
    )
    .post(
        "/auth/join",
        async ({ client, lucia, cookie, body }) => {
            const hashedPassword = await hash(body.password, {
                memoryCost: 19456,
                timeCost: 2,
                outputLen: 32,
                parallelism: 1,
            });

            const user = await queries.createUser(client, {
                email: body.email,
                hashed_password: hashedPassword,
            });

            const session = await lucia.createSession(user.id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            const sessionCookieAttributes = cookie[sessionCookie.name];

            setSessionCookie(sessionCookieAttributes, sessionCookie);

            return null;
        },
        {
            body: t.Object({
                email: t.String({ format: "email", error: "Invalid email." }),
                password: t.String({
                    minLength: 8,
                    pattern: '(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).*',
                    error: "Password must be at least 8 characters long and contain at least one uppercase letter and one special character.",
                }),
            }),
            response: t.Null(),
        }
    )
    .post("/auth/logout", async ({ lucia, cookie }) => {
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
