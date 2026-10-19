import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matches",
};

export default function MatchesPage() {
  return (
    <>
      <h1 className="text-xl mb-4 font-semibold">Matches</h1>
      <p className="text-muted">Find opponents and keep track of your matches.</p>
    </>
  );
}
