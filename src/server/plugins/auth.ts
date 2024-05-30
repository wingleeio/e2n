import { hash, verify } from "@node-rs/argon2";
import Elysia, { t } from "elysia";

import { EmailVerification } from "@/emails/email-verification";
import { setSessionCookie } from "@/lib/lucia/set-session-cookie";
import { CreateUserReturns } from "@/schema/queries";
import { ApiError } from "@/server/error";
import { TimeSpan, createDate } from "oslo";
import { alphabet, generateRandomString } from "oslo/crypto";
import { context } from "../context";

export const auth = new Elysia()
    .use(context)
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
                    email: t.String({ format: "email" }),
                    email_verified: t.Boolean(),
                }),
            ]),
        }
    )
    .post(
        "/auth/signin",
        async ({ client, lucia, cookie, body, queries }) => {
            const user = await queries.getUserWithHashedPassword(client, {
                email: body.email,
            });

            if (!user) {
                throw new ApiError(401, "Invalid email or password.");
            }

            const verified = await verify(user.hashed_password, body.password, {
                memoryCost: 19456,
                timeCost: 2,
                outputLen: 32,
                parallelism: 1,
            });

            if (!verified) {
                throw new ApiError(401, "Invalid email or password.");
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
        async ({ client, lucia, cookie, body, queries, resend }) => {
            const hashedPassword = await hash(body.password, {
                memoryCost: 19456,
                timeCost: 2,
                outputLen: 32,
                parallelism: 1,
            });

            let user: CreateUserReturns;

            try {
                user = await queries.createUser(client, {
                    email: body.email,
                    hashed_password: hashedPassword,
                });
            } catch (e) {
                throw new ApiError(422, "Email already in use.");
            }

            const emailVerification = await queries.createEmailVerification(
                client,
                {
                    code: generateRandomString(8, alphabet("0-9")),
                    user_id: user.id,
                    expires_at: createDate(new TimeSpan(15, "m")),
                }
            );

            const { error } = await resend.emails.send({
                from: "EdgeDB Elysia Next.js <no-reply@resend.uwulabs.io>",
                to: [body.email],
                subject: "Verify your email address",
                react: EmailVerification({ code: emailVerification.code }),
            });

            if (error) {
                throw new ApiError(500, "Failed to send email verification.");
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
        "/auth/logout",
        async ({ lucia, cookie }) => {
            const sessionCookieAttributes = cookie[lucia.sessionCookieName];
            const sessionId = sessionCookieAttributes.value;

            const { session } = await lucia.validateSession(sessionId);

            if (session) {
                sessionCookieAttributes.remove();
                await lucia.invalidateSession(session.id);
            }

            return null;
        },
        {
            response: t.Null(),
        }
    );
