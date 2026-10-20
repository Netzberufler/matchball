"use client";

import { Fragment, useLayoutEffect, useState } from "react";

// Next.js keeps visited pages mounted but hidden (React <Activity>). Hiding
// detaches React Aria's form labels, which then warns "If you do not provide
// a visible label..." on every render. Remounting the children when the page
// is hidden avoids that, and the form is fresh again when the user returns.
export function ResetWhenHidden({ children }: { children: React.ReactNode }) {
    const [key, setKey] = useState(0);

    // The cleanup runs when the page is hidden
    useLayoutEffect(() => () => setKey((current) => current + 1), []);

    return <Fragment key={key}>{children}</Fragment>;
}
