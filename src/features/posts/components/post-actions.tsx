import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@heroui/react";

// The reply and like buttons under a post, in feeds and on its own page.
// TODO: replies and likes, with their counts.
export function PostActions({ className }: { className?: string }) {
    return (
        <div className={`-ml-2 flex gap-6 ${className ?? ""}`}>
            <Button
                isIconOnly
                size="sm"
                variant="ghost"
                aria-label="Reply"
                className="text-muted"
            >
                <MessageCircle className="size-4" aria-hidden />
            </Button>
            <Button
                isIconOnly
                size="sm"
                variant="ghost"
                aria-label="Like"
                className="text-muted"
            >
                <Heart className="size-4" aria-hidden />
            </Button>
        </div>
    );
}
