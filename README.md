# [E2N Stack - @wingleeio](https://github.com/wingleeio/elysia-edgedb)

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
