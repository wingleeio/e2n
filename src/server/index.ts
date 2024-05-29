import { Elysia } from "elysia";
import { auth } from "@/server/plugins/auth";

export const app = new Elysia({ prefix: "/api" }).use(auth);

export type App = typeof app;
