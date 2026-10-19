import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";
import MobileNavBar from "@/components/layout/mobile-nav-bar";

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
            className={`h-full light antialiased ${figtree.className}`}
            data-theme="light"
        >
            <body className="min-h-ful bg-background text-foreground">
                <div className="mx-auto w-full max-w-6xl px-2 sm:px-4 grid grid-cols-1 md:grid-cols-[320px_1fr]">
                    <Sidebar />
                    <main className="min-h-dvh px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-8 sm:pt-8 md:pb-8">
                        {children}
                    </main>
                </div>
                <MobileNavBar />
            </body>
        </html>
    );
}
