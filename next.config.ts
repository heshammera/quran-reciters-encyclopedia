import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "archive.org",
            },
            {
                protocol: "https",
                hostname: "**.archive.org",
            },
        ],
    },

    experimental: {
        serverActions: {
            bodySizeLimit: "200mb",
        },
    },

    turbopack: {},
};

const withPWA = require("@ducanh2912/next-pwa").default({
    dest: "public",
    register: true,
    skipWaiting: true,
    reloadOnOnline: false, // CRITICAL: Disable auto-reload when back online
    disable: process.env.NODE_ENV === "development",
});

export default withPWA(nextConfig);
