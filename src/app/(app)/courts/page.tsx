import type { Metadata } from "next";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
    title: "Court Booking",
};

export default function CourtBookingPage() {
    return (
        <>
            <div className="mb-4 flex items-center gap-2">
                {/* Always home, as this is a top-level section */}
                <BackButton href="/" />
                <h1 className="text-xl font-semibold">Court Booking</h1>
            </div>
            <p className="text-muted">Book courts at your tennis club.</p>
        </>
    );
}
