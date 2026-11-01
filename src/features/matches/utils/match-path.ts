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

// The add match form's query parameter for an accepted challenge's id: the
// match is logged for it, against its other player, who can't be changed
export const CHALLENGE_PARAM = "challenge";

// The add match form for the match of an accepted challenge
export function logChallengeMatchPath(challengeId: string) {
    return `${MATCHES_PATH}/add?${new URLSearchParams({ [CHALLENGE_PARAM]: challengeId })}`;
}
