import { client } from "@/lib/database";
import { Lucia } from "lucia";
import { EdgeDBAdapter } from "./edgedb-adapter";

const adapter = new EdgeDBAdapter(client);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === "production",
        },
    },
    getUserAttributes: (attributes) => {
        return attributes;
    },
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
        DatabaseSessionAttributes: DatabaseSessionAttributes;
    }
}

interface DatabaseUserAttributes {
    email: string;
}
interface DatabaseSessionAttributes {}
