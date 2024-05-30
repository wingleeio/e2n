# [e2n Stack - @wingleeio](https://github.com/wingleeio/elysia-edgedb)

This is a starter kit that provides a foundation for building web applications using ElysiaJS and Next.js.

## Features

-   [x] Fully typesafe API client powered by ElysiaJS
-   [x] Authentication with email verification codes using Lucia and Resend
-   [x] EdgeDB integration
-   [ ] Stripe integration

## Getting Started

This project requires a `RESEND_API_KEY` to send emails to users. Create a `.env.local` file or rename `.env.sample` and
add your own api key from [Resend](https://resend.com).

To setup EdgeDB locally, run `edgedb project init` in the root directory of this project. If you have not setup EdgeDB before, follow the instructions on [their website](https://edgedb.com).

Then you can run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Helpful tips

This project contains a handful of useful utilities to make developing your project easier.

### Managing authentication

Once a user is authenticated, you have access to the session on the client side with the `useAuth` hook.

```tsx
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

You can manage what to render the server or client side using `ClientSignedIn`, `ClientSignedOut`, `ServerSignedIn`, and `ServerSignedOut`.

```tsx
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

`ClientSignedIn` can also take a callback as a child. Within this callback you have access to the `user` object.

```tsx
import { ClientSignedIn } from "@/components/client-signed-in";
import { ClientSignedOut } from "@/components/client-signed-out";

const SomeComponent = () => {
    return (
        <div>
            <ClientSignedIn>
                {(user) => <>Hello, your email is {user.email}</>}
            </ClientSignedIn>
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
