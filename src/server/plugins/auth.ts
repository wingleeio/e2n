import Elysia, { t } from "elysia";
import { TimeSpan, createDate } from "oslo";
import { alphabet, generateRandomString } from "oslo/crypto";
import { hash, verify } from "@node-rs/argon2";

import { ApiError } from "@/server/error";
import { CreateUserReturns } from "@/schema/queries";
import { EmailVerification } from "@/emails/email-verification";
import { IS_PRODUCTION } from "@/lib/constants";
import { context } from "../context";
import { generateState } from "arctic";
import { setSessionCookie } from "@/lib/lucia/set-session-cookie";

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
    .get(
        "/oauth/:provider",
        async ({ oauth, params, redirect, cookie }) => {
            const state = generateState();

            let url: URL;

            switch (params.provider) {
                case "github":
                    url = await oauth.github.createAuthorizationURL(state);
                    break;
                default:
                    throw new ApiError(404, "Provider not found.");
            }

            cookie["oauth_state"].value = state;
            cookie["oauth_state"].maxAge = 60 * 10;
            cookie["oauth_state"].httpOnly = true;
            cookie["oauth_state"].secure = IS_PRODUCTION;
            cookie["oauth_state"].path = "/";

            cookie["oauth_provider"].value = params.provider;
            cookie["oauth_provider"].maxAge = 60 * 10;
            cookie["oauth_provider"].httpOnly = true;
            cookie["oauth_provider"].secure = IS_PRODUCTION;
            cookie["oauth_provider"].path = "/";

            // TODO: This redirect is not properly set. The client_id is undefined for some reason.
            return redirect(url.toString());
        },
        {
            params: t.Object({
                provider: t.Union([t.Literal("github")]),
            }),
        }
    )
    .get(
        "/oauth/callback",
        async ({ cookie, query, oauth }) => {
            const provider = cookie["oauth_provider"].value;
            const storedState = cookie["oauth_state"].value;
            const { code, state } = query;

            if (
                !provider ||
                !code ||
                !state ||
                !storedState ||
                state !== storedState
            ) {
                throw new ApiError(400, "Invalid state or code.");
            }

            switch (provider) {
                case "github":
                    {
                        const tokens =
                            await oauth.github.validateAuthorizationCode(code);
                        const response = await fetch(
                            "https://api.github.com/user",
                            {
                                headers: {
                                    Authorization: `Bearer ${tokens.accessToken}`,
                                },
                            }
                        );
                        const user: { email: string } = await response.json();
                        console.log(user);
                    }
                    break;
                default:
                    throw new ApiError(404, "Provider not found.");
            }
        },
        {
            query: t.Object({
                code: t.String(),
                state: t.String(),
            }),
            cookie: t.Cookie({
                oauth_provider: t.Union([t.Literal("github")]),
                oauth_state: t.String(),
            }),
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
