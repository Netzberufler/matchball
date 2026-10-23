// The URL of a post's own page
export function postPath(id: string) {
    return `/post/${encodeURIComponent(id)}`;
}
