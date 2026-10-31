import { Button, Card, EmptyState } from "@heroui/react";

// A list in a card, its items divided by lines, e.g. posts or people. Its
// children are the <li>s. `aria-hidden` for placeholders while it loads.
export function ListCard({
    children,
    "aria-hidden": ariaHidden,
}: {
    children: React.ReactNode;
    "aria-hidden"?: boolean;
}) {
    return (
        <Card className="gap-0 overflow-hidden p-0" aria-hidden={ariaHidden}>
            <ul className="divide-y divide-separator">{children}</ul>
        </Card>
    );
}

// A card saying there's nothing to show, e.g. "No posts yet"
export function EmptyCard({ children }: { children: React.ReactNode }) {
    return (
        <Card>
            <EmptyState className="text-center">{children}</EmptyState>
        </Card>
    );
}

// A card saying something couldn't be loaded, with a "Try again" button
export function RetryCard({
    message,
    onRetry,
}: {
    // E.g. "Couldn't load the matches."
    message: string;
    onRetry: () => void;
}) {
    return (
        <Card>
            <EmptyState className="flex flex-col items-center gap-3 text-center">
                <p role="alert">{message}</p>
                <Button variant="tertiary" onPress={onRetry}>
                    Try again
                </Button>
            </EmptyState>
        </Card>
    );
}
