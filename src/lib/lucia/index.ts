import { AUTH_COOKIE } from "@/lib/constants";
import { client } from "@/lib/database";
import { EdgeDBAdapter } from "@/lib/lucia/edgedb-adapter";
import { Lucia } from "lucia";

const adapter = new EdgeDBAdapter(client);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        name: AUTH_COOKIE,
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
