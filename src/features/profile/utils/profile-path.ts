// The URL of a user's profile page
export function profilePath(username: string) {
    return `/profile/${encodeURIComponent(username)}`;
}
