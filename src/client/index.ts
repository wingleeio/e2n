import { App } from "@/server";
import { treaty } from "@elysiajs/eden";

export const { api } = (function () {
    if (typeof window === "undefined") {
        return treaty<App>("localhost:3000", {
            headers: require("next/headers").headers(),
        });
    }

    return treaty<App>("localhost:3000");
})();
