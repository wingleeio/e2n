import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "@/lib/constants";
import { GitHub, OAuth2Provider } from "arctic";

export type OAuthProvider = "github";

export const oauth: { [k in OAuthProvider]: OAuth2Provider } = {
    github: new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET),
};

export type getAttributes = (
    accessToken: string
) => Promise<{ email: string | undefined }>;

const attributes: { [k in OAuthProvider]: getAttributes } = {
    github: async (accessToken: string) => {
        const response = await fetch("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const emails: {
            email: string;
            primary: boolean;
        }[] = await response.json();

        const email = emails.find((email) => email.primary)?.email;

        return {
            email,
        };
    },
};

export const getAttributes = async (provider: OAuthProvider, token: string) => {
    return attributes[provider](token);
};
