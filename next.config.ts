import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        agentFeedback: true,
        serverActions: {
            // Room for a profile photo of up to 5 MB (AVATAR_MAX_BYTES) plus
            // the form encoding. Applies to every action.
            bodySizeLimit: "6mb",
        },
    },
    cacheComponents: true,
    partialPrefetching: true,
    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
};

export default nextConfig;
