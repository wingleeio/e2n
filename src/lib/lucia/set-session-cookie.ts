import type { Cookie as ElysiaCookie } from "elysia";
import type { Cookie as LuciaCookie } from "lucia";

export const setSessionCookie = (
    elysiaCookie: ElysiaCookie<any>,
    luciaCookie: LuciaCookie
) => {
    elysiaCookie.value = luciaCookie.value;
    elysiaCookie.sameSite = luciaCookie.attributes.sameSite;
    elysiaCookie.secure = luciaCookie.attributes.secure;
    elysiaCookie.path = luciaCookie.attributes.path;
    elysiaCookie.domain = luciaCookie.attributes.domain;
};
