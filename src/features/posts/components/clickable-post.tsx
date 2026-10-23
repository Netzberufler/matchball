"use client";

import { useRouter } from "next/navigation";

// Makes a whole post open `href` when clicked, like on Twitter and Bluesky,
// while its text stays selectable. Clicks on links and buttons inside the
// post, and clicks that end a text selection, are left alone. This is only
// for the mouse: keyboard and screen reader users get a real link to the
// post inside it (its time).
export function ClickablePost({
    href,
    className,
    children,
}: {
    href: string;
    className?: string;
    children: React.ReactNode;
}) {
    const router = useRouter();

    function shouldIgnore(event: React.MouseEvent<HTMLElement>) {
        const target = event.target as Element;
        return (
            event.defaultPrevented ||
            target.closest("a, button, [role='button']") !== null ||
            // The user selected text, e.g. to copy it
            (window.getSelection()?.toString() ?? "") !== ""
        );
    }

    function onClick(event: React.MouseEvent<HTMLElement>) {
        if (event.button !== 0 || shouldIgnore(event)) {
            return;
        }
        // Like a link: Cmd, Ctrl or Shift opens a new tab
        if (event.metaKey || event.ctrlKey || event.shiftKey) {
            window.open(href, "_blank", "noopener");
        } else {
            router.push(href);
        }
    }

    // Pressing the mouse wheel on plain content starts autoscrolling in
    // some browsers (Windows, Firefox with autoscroll on), which swallows the
    // click. Links don't autoscroll, so stop it here too.
    function onMouseDown(event: React.MouseEvent<HTMLElement>) {
        if (event.button === 1 && !shouldIgnore(event)) {
            event.preventDefault();
        }
    }

    // Middle click opens a new tab, like a link
    function onAuxClick(event: React.MouseEvent<HTMLElement>) {
        if (event.button === 1 && !shouldIgnore(event)) {
            window.open(href, "_blank", "noopener");
        }
    }

    return (
        <article
            className={`cursor-pointer ${className ?? ""}`}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onAuxClick={onAuxClick}
        >
            {children}
        </article>
    );
}
