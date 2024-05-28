import { AUTH_HEADER } from "@/lib/constants";
import { headers } from "next/headers";
import { api } from "./api";

type UserFromSession = Awaited<ReturnType<typeof api.auth.session.get>>["data"];

export type AuthResult =
    | {
          user: NonNullable<UserFromSession>;
          isAuthenticated: true;
      }
    | {
          user: null;
          isAuthenticated: false;
      };

export const auth = (): AuthResult => {
    const data = headers().get(AUTH_HEADER);

    if (data) {
        return {
            user: JSON.parse(data),
            isAuthenticated: true,
        };
    }

    return {
        user: null,
        isAuthenticated: false,
    };
};
