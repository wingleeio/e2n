import { AUTH_HEADER } from "@/lib/constants";
import { headers } from "next/headers";

export const auth = () => {
    const data = headers().get(AUTH_HEADER);

    if (data) {
        return JSON.parse(data);
    }

    return null;
};
