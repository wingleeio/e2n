import * as queries from "@/db/queries";
import type { Client } from "edgedb";
import type { Adapter, DatabaseSession, DatabaseUser } from "lucia";

export class EdgeDBAdapter implements Adapter {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async deleteSession(sessionId: string) {
        await queries.deleteSession(this.client, {
            session_id: sessionId,
        });
    }

    async deleteUserSessions(userId: string) {
        await queries.deleteUserSessions(this.client, {
            user_id: userId,
        });
    }

    async getSessionAndUser(
        sessionId: string
    ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
        const result = await queries.getSessionAndUser(this.client, {
            session_id: sessionId,
        });

        if (result === null) {
            return [null, null];
        }

        return [
            {
                id: result.session_id,
                expiresAt: result.expires_at,
                attributes: {},
                userId: result.user.id,
            },
            { id: result.user.id, attributes: {} },
        ];
    }

    async getUserSessions(userId: string) {
        const result = await queries.getUserSessions(this.client, {
            user_id: userId,
        });

        return result.map((session) => ({
            id: session.session_id,
            expiresAt: session.expires_at,
            userId: session.user.id,
            attributes: {},
        }));
    }

    async setSession(session: DatabaseSession) {
        await queries.setSession(this.client, {
            session_id: session.id,
            user_id: session.userId,
            expires_at: session.expiresAt,
        });
    }

    async updateSessionExpiration(sessionId: string, expiresAt: Date) {
        await queries.updateSessionExpiration(this.client, {
            session_id: sessionId,
            expires_at: expiresAt,
        });
    }

    async deleteExpiredSessions() {
        await queries.deleteExpiredSessions(this.client);
    }
}
