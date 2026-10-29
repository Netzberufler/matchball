import { defineConfig } from "vitest/config";

// Read before any test imports code that formats dates in the local time zone
process.env.TZ = "UTC";

export default defineConfig({
    // The @/* imports from tsconfig.json
    resolve: { tsconfigPaths: true },
    test: {
        // Unit tests of pure code, so no browser environment
        environment: "node",
        include: ["src/**/*.test.ts"],
    },
});
