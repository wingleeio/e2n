import createClient from "edgedb";

export const client = createClient({
    tlsSecurity: process.env.NODE_ENV === "development" ? "insecure" : undefined,
}).withConfig({
    allow_user_specified_id: true,
});
