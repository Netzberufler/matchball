import { Separator } from "@heroui/react";

// A horizontal line with a short label in the middle, e.g. between two
// alternative actions
export function LabeledSeparator({
    children = "Or",
}: {
    children?: React.ReactNode;
}) {
    return (
        <div className="flex w-full items-center gap-2 py-2">
            <Separator className="flex-1" />
            <p className="text-center text-xs font-medium text-muted uppercase">
                {children}
            </p>
            <Separator className="flex-1" />
        </div>
    );
}
