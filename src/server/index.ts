import { auth } from "@/server/plugins/auth";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

export const app = new Elysia({ prefix: "/api" }).use(swagger()).use(auth);

export type App = typeof app;
