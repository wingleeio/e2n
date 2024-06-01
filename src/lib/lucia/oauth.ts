import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "@/lib/constants";
import { GitHub, OAuth2Provider } from "arctic";

type OAuth = {
    client: OAuth2Provider;
    getAttributes: (accessToken: string) => Promise<{ email: string | undefined; id: string | number | undefined }>;
};

export type OAuthProvider = "github";

export const oauth: { [k in OAuthProvider]: OAuth } = {
    github: {
        client: new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET),
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
