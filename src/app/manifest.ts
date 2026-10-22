import type { MetadataRoute } from "next";

// The PNGs in public/icons are rendered from app/icon.svg
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Matchball",
        short_name: "Matchball",
        description: "The social app for tennis players and tennis clubs.",
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        // The light theme's --background, shown on the launch screen
        background_color: "#f0f5fe",
        theme_color: "#f0f5fe",
        icons: [
            {
                src: "/icon.svg",
                sizes: "any",
                type: "image/svg+xml",
            },
            {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/icons/icon-maskable-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
    };
}
