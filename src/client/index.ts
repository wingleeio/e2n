import { App } from "@/server";
import { treaty } from "@elysiajs/eden";

export const client = treaty<App>("localhost:3000");
