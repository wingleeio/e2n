import { hash, verify } from "@node-rs/argon2";
import Elysia, { t } from "elysia";
import { TimeSpan, createDate } from "oslo";
import { alphabet, generateRandomString } from "oslo/crypto";

import { EmailVerification } from "@/emails/email-verification";
import { setSessionCookie } from "@/lib/lucia/set-session-cookie";
import { CreateUserReturns } from "@/schema/queries";
import { ApiError } from "@/server/error";
import { context } from "../context";

export const auth = new Elysia({ prefix: "/auth" })
    .use(context)
    .get(
        "/session",
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
        "/signin",
        async ({ client, lucia, cookie, body, queries }) => {
            const user = await queries.getUserWithHashedPassword(client, {
                email: body.email,
            });

            if (!user) {
                throw new ApiError(401, "Invalid email or password.");
            }

            if (!user.hashed_password) {
                throw new ApiError(401, "Invalid email or password.");
            }

            const verified = await verify(user.hashed_password ?? "", body.password, {
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
        "/join",
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
                    email_verified: false,
                });
            } catch (e) {
                throw new ApiError(422, "Email already in use.");
            }

            const emailVerification = await queries.createEmailVerification(client, {
                code: generateRandomString(8, alphabet("0-9")),
                user_id: user.id,
                expires_at: createDate(new TimeSpan(15, "m")),
            });

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
        "/verify",
        async ({ user, client, queries, body }) => {
            if (!user) {
                throw new ApiError(401, "Unauthorized.");
            }

            if (user.email_verified) {
                throw new ApiError(422, "Email already verified.");
            }

            const verified = await queries.verifyEmail(client, {
                user_id: user.id,
                code: body.code,
            });

            if (!verified) {
                throw new ApiError(422, "Invalid verification code.");
            }

            await queries.updateUser(client, {
                user_id: user.id,
                email_verified: true,
            });

            await queries.deleteEmailVerificationCodes(client, {
                user_id: user.id,
            });

            return null;
        },
        {
            body: t.Object({
                code: t.String({
                    minLength: 8,
                    maxLength: 8,
                    pattern: "^[0-9]{8}$",
                    error: "Invalid verification code.",
                }),
            }),
            response: t.Null(),
        }
    )
    .post(
        "/resend",
        async ({ user, resend, queries, client }) => {
            if (!user) {
                throw new ApiError(401, "Unauthorized.");
            }

            if (user.email_verified) {
                throw new ApiError(422, "Email already verified.");
            }

            await queries.deleteEmailVerificationCodes(client, {
                user_id: user.id,
            });

            const emailVerification = await queries.createEmailVerification(client, {
                code: generateRandomString(8, alphabet("0-9")),
                user_id: user.id,
                expires_at: createDate(new TimeSpan(15, "m")),
            });

            const { error } = await resend.emails.send({
                from: "EdgeDB Elysia Next.js <no-reply@resend.uwulabs.io>",
                to: [user.email],
                subject: "Verify your email address",
                react: EmailVerification({ code: emailVerification.code }),
            });

            if (error) {
                throw new ApiError(500, "Failed to send email verification.");
            }

            return null;
        },
        {
            response: t.Null(),
        }
    )
    .post(
        "/logout",
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
