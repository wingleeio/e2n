import { Lucia } from "lucia";
import { client } from "../edgedb";
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
        return {};
    },
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
        DatabaseSessionAttributes: DatabaseSessionAttributes;
    }
}

interface DatabaseUserAttributes {}
interface DatabaseSessionAttributes {}
