// The URL of a user's profile page
export function profilePath(username: string) {
    return `/profile/${encodeURIComponent(username)}`;
}

// The list of a user's followers
export function followersPath(username: string) {
    return `${profilePath(username)}/followers`;
}

// The list of users a user follows
export function followingPath(username: string) {
    return `${profilePath(username)}/follows`;
}
