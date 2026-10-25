import { readAvatar } from "@/features/account/lib/avatar-storage";

// Serves uploaded profile photos. Like Google profile pictures, they're
// public: src/proxy.ts skips paths with a dot, and the names are random.
export async function GET(
    _request: Request,
    ctx: RouteContext<"/avatars/[file]">,
) {
    const { file } = await ctx.params;
    const photo = await readAvatar(file);
    if (!photo) {
        return new Response("Not found", { status: 404 });
    }

    return new Response(new Uint8Array(photo), {
        headers: {
            // Always WebP: every upload is re-encoded
            "Content-Type": "image/webp",
            // Browsers must not guess another type, e.g. HTML
            "X-Content-Type-Options": "nosniff",
            // Nothing in the response may run, if it's ever opened directly
            "Content-Security-Policy": "default-src 'none'; sandbox",
            // A new photo gets a new name, so a name's content never changes
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
