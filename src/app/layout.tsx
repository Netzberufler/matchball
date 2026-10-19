import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";
import MobileNavBar from "@/components/layout/mobile-nav-bar";
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
                <ThemeProvider>
                    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-0 max-sm:py-4 max-md:py-6 grid grid-cols-1 md:grid-cols-[96px_1fr] lg:grid-cols-[320px_1fr]">
                        <Sidebar />
                        <main className="min-h-dvh max-md:pb-[calc(var(--mobile-nav-height)+var(--mobile-nav-offset))] md:px-8 md:py-8">
                            {children}
                        </main>
                    </div>
                    <MobileNavBar />
                </ThemeProvider>
            </body>
        </html>
    );
}
