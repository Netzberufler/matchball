// The signed-in user's matches: pending, then played
export const MATCHES_PATH = "/matches";

// A match's own page
export function matchPath(id: string) {
    return `${MATCHES_PATH}/${encodeURIComponent(id)}`;
}

// The form to change a pending match
export function editMatchPath(id: string) {
    return `${matchPath(id)}/edit`;
}

// The add match form's query parameter for the opponent's username, which
// starts the form with them chosen
export const OPPONENT_PARAM = "opponent";

// The add match form, with `opponentUsername` (if given) chosen as the
// opponent, e.g. from their profile
export function addMatchPath(opponentUsername?: string) {
    return opponentUsername
        ? `${MATCHES_PATH}/add?${new URLSearchParams({ [OPPONENT_PARAM]: opponentUsername })}`
        : `${MATCHES_PATH}/add`;
}
