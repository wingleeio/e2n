import * as queries from "@/schema/queries";
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

    async getSessionAndUser(sessionId: string): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
        const result = await queries.getSessionAndUser(this.client, {
            session_id: sessionId,
        });

        if (result === null) {
            return [null, null];
        }

        const { id: _, session_id, expires_at, user, ...sessionAttributes } = result;
        const { id: userId, ...userAttributes } = user;

        return [
            {
                id: session_id,
                expiresAt: expires_at,
                attributes: sessionAttributes,
                userId: user.id,
            },
            { id: userId, attributes: userAttributes },
        ];
    }

    async getUserSessions(userId: string) {
        const result = await queries.getUserSessions(this.client, {
            user_id: userId,
        });

        return result.map((session) => {
            const { id: _, session_id, expires_at, user, ...sessionAttributes } = session;

            return {
                id: session_id,
                expiresAt: expires_at,
                userId: user.id,
                attributes: sessionAttributes,
            };
        });
    }

    async setSession(session: DatabaseSession) {
        await queries.setSession(this.client, {
            session_id: session.id,
            user_id: session.userId,
            expires_at: session.expiresAt,
            ...session.attributes,
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
