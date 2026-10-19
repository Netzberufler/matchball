import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html
            lang="en"
            className={`h-full light antialiased ${figtree.className}`}
            data-theme="light"
        >
            <body className="min-h-ful bg-background text-foreground">
                <div className="mx-auto w-full max-w-6xl px-2 sm:px-4 grid grid-cols-[320px_1fr]">
                    <Sidebar />
                    <main className="min-h-dvh py-4 px-4 sm:py-8 sm:px-8">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
