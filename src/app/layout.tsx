import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";

const figtree = Figtree({
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "Matchball",
        template: "%s · Matchball",
    },
    description: "The social app for tennis players and tennis clubs.",
    applicationName: "Matchball",
    // Opens without browser UI when added to the iOS home screen
    appleWebApp: {
        capable: true,
        title: "Matchball",
        statusBarStyle: "default",
    },
};

export const viewport: Viewport = {
    // Let the mobile nav bar extend into the safe area on notched devices
    viewportFit: "cover",
    // --background of each theme, for the browser UI around the page
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f0f5fe" },
        { media: "(prefers-color-scheme: dark)", color: "#04060a" },
    ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="en"
            className={`h-full antialiased ${figtree.className}`}
            suppressHydrationWarning
        >
            <body className="min-h-full bg-background text-foreground">
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
