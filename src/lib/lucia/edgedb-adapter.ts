import type { Client } from "edgedb";
import type { Adapter, DatabaseSession } from "lucia";

export class EdgeDBAdapter implements Adapter {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async deleteSession(sessionId: string) {}

    async deleteUserSessions(userId: string) {}

    async getSessionAndUser(sessionId: string) {}

    async getUserSessions(userId: string) {}

    async setSession(session: DatabaseSession) {}

    async updateSessionExpiration(sessionId: string, expiresAt: Date) {}

    async deleteExpiredSessions(): Promise<void> {}
}
