import { auth } from "@/server/plugins/auth";
import { Elysia } from "elysia";

export const app = new Elysia({ prefix: "/api" }).use(auth);

export type App = typeof app;
