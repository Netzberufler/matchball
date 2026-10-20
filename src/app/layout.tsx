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
};

// Let the mobile nav bar extend into the safe area on notched devices
export const viewport: Viewport = {
    viewportFit: "cover",
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
