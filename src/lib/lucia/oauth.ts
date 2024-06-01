import {
    DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET,
    GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET,
    OAUTH_CALLBACK_URL,
} from "@/lib/constants";
import { Discord, GitHub } from "arctic";

type OAuth = {
    client: Discord | GitHub;
    scopes: string[];
    getAttributes: (accessToken: string) => Promise<{ email: string | undefined; id: string | number | undefined }>;
};

export type OAuthProvider = "github" | "discord";

type OAuthProviders = { [k in OAuthProvider]: OAuth };

export const oauth: OAuthProviders = {
    discord: {
        client: new Discord(DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, OAUTH_CALLBACK_URL),
        scopes: ["identify", "email"],
        getAttributes: async (accessToken: string) => {
            const headers = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            };
            const response = await fetch("https://discord.com/api/users/@me", headers);
            const user: {
                email: string;
                id: string;
            } = await response.json();

            return {
                email: user.email,
                id: user.id,
            };
        },
    },
    github: {
        client: new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET),
        scopes: ["user:email"],
        getAttributes: async (accessToken: string) => {
            const headers = {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            };
            const responses = await Promise.all([
                fetch("https://api.github.com/user", headers),
                fetch("https://api.github.com/user/emails", headers),
            ]);

            const user: {
                id: number;
            } = await responses[0].json();

            const emails: {
                email: string;
                primary: boolean;
            }[] = await responses[1].json();

            const email = emails.find((email) => email.primary)?.email;

            return {
                id: user.id,
                email,
            };
        },
    },
};
