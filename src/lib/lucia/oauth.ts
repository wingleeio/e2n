import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "@/lib/constants";

import { GitHub } from "arctic";

export const oauth = {
    github: new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET),
};
