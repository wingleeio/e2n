import { Elysia, t } from "elysia";

export const app = new Elysia({ prefix: "/api" })
    .get(
        "/ping",
        ({ cookie: { name } }) => {
            console.log(name.value);
            return {
                message: `Hello, world!`,
            };
        },
        {
            response: t.Object({
                message: t.String(),
            }),
        }
    )
    .get(
        "/session",
        () => {
            return {
                name: "test",
            };
        },
        {
            response: t.Object({
                name: t.String(),
            }),
        }
    )
    .post("/ping", ({ cookie: { name } }) => {
        name.value = "test";
        return name.value;
    });

export type App = typeof app;
