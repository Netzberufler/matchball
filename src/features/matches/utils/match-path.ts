// The add match form's query parameter for the opponent's username, which
// starts the form with them chosen
export const OPPONENT_PARAM = "opponent";

// The add match form, with `opponentUsername` (if given) chosen as the
// opponent, e.g. from their profile
export function addMatchPath(opponentUsername?: string) {
    return opponentUsername
        ? `/matches/add?${new URLSearchParams({ [OPPONENT_PARAM]: opponentUsername })}`
        : "/matches/add";
}
