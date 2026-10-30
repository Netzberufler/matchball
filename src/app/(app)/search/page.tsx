import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Search",
};

export default function SearchPage() {
    return (
        <>
            <h1 className="text-xl mb-4 font-semibold">Search</h1>
            <p className="text-muted">Find players, clubs and matches.</p>
        </>
    );
}
