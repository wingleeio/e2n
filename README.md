# [e2n Stack - @wingleeio](https://github.com/wingleeio/e2n)

This is a starter kit that provides a foundation for building web applications using ElysiaJS and Next.js.

## Features

-   [x] Fully typesafe API client powered by ElysiaJS
-   [x] Authentication with email verification codes using Lucia and Resend
-   [x] OAuth using Arctic
-   [x] EdgeDB integration

## TODO

-   [ ] Update OAuth2 error handling (User with email already exists, etc)
-   [ ] Stripe integration

## Getting Started

This project requires a `RESEND_API_KEY` to send emails to users. Create a `.env.local` file or rename `.env.sample` and
add your own api key from [Resend](https://resend.com).

To setup EdgeDB locally, run `edgedb project init` in the root directory of this project. If you have not setup EdgeDB before, follow the instructions on [their website](https://edgedb.com).

After EdgeDB is setup, you have to generate the query functions using the following command:

```bash
yarn generate:queries
```

Then you can run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Helpful tips

This project contains a handful of useful utilities to make developing your project easier.

### Managing authentication

Once a user is authenticated, you have access to the session on the client side with the `useAuth` hook.

```tsx
"use client";
import { useAuth } from "@/hooks/use-auth";

const SomeComponent = () => {
    const session = useAuth();

    if (session.isAuthenticated) {
        // Here session.user will now be defined

        console.log(session.user.id);
    }

    return null;
};
```

Similarly, you have access to the user session on the server side using the `auth` helper function.

```tsx
import { auth } from "@/lib/auth";

export default function SomeComponent() {
    const session = auth();

    if (session.isAuthenticated) {
        // Here session.user will now be defined

        console.log(session.user.id);
    }

    return null;
}
```

You can manage what to render the server or client side using `ClientSignedIn`, `ClientSignedOut`, `ServerSignedIn`, and `ServerSignedOut`.

```tsx
"use client";
import { ClientSignedIn } from "@/components/client-signed-in";
import { ClientSignedOut } from "@/components/client-signed-out";

const SomeComponent = () => {
    return (
        <div>
            <ClientSignedIn>Hello, I'm signed in!</ClientSignedIn>
            <ClientSignedOut>Hello, I'm not signed in!</ClientSignedOut>
        </div>
    );
};
```

`ClientSignedIn` and `ServerSignedIn` can also take a callback as a child. Within this callback you have access to the `user` object.

```tsx
"use client";
import { ClientSignedIn } from "@/components/client-signed-in";
import { ClientSignedOut } from "@/components/client-signed-out";

const SomeComponent = () => {
    return (
        <div>
            <ClientSignedIn>{(user) => <>Hello, your email is {user.email}</>}</ClientSignedIn>
            <ClientSignedOut>Hello, I'm not signed in!</ClientSignedOut>
        </div>
    );
};
```

Protected or public routes can be defined in `middleware.ts`. Update the arrays passed to createRouteMatcher to update what routes should be protected or public.

```ts
// These functions can also take regex matching strings
const isProtectedRoute = createRouteMatcher(["/verify"]);
const isPublicRoute = createRouteMatcher(["/join", "/login"]);
```

To change the OAuth providers, you can add or remove them from `@/lib/lucia/oauth`. Take a look at the following example adding Discord as an OAuth provider for reference.

```ts
export const oauth: OAuthProviders = {
    discord: {
        client: new Discord(DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, "http://localhost:3000/oauth/callback"),
        scopes: ["identify", "email"],
        getAttributes: async (accessToken: string) => {
            const headers = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            };
            const response = await fetch("https://discord.com/api/users/@me", headers);
            const user: {
                email: string;
                id: string;
            } = await response.json();

            return {
                email: user.email,
                id: user.id,
            };
        },
    },
};
```
