import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Court Booking",
};

export default function CourtBookingPage() {
    return (
        <>
            <h1 className="text-xl mb-4 font-semibold">Court Booking</h1>
            <p className="text-muted">Book courts at your tennis club.</p>
        </>
    );
}
