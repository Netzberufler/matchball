import Image from "next/image";
import { Avatar } from "@heroui/react";

// The user's picture (e.g. from Google), or the default avatar when there is
// none, while it loads, or if it fails. alt is empty because the name is
// always shown next to it.
export function UserAvatar({ image }: { image?: string | null }) {
    return (
        <Avatar className="shrink-0">
            {image && <Avatar.Image alt="" src={image} />}
            <Avatar.Fallback>
                <Image
                    alt=""
                    src="/default-avatar.jpg"
                    width={40}
                    height={40}
                    className="size-full object-cover"
                />
            </Avatar.Fallback>
        </Avatar>
    );
}
