import {
    type EnteredSet,
    SCORE_MAX,
} from "@/features/matches/utils/match-score";

// Field names of the add match form, read by the form for checking before
// it's sent and by createMatch
export const PLAYED_AT_FIELD = "playedAt";
export const OPPONENT_FIELD = "opponentId";
export const SET_NUMBERS = [1, 2, 3] as const;

export function scoreField(set: 1 | 2 | 3, side: "own" | "opponent") {
    return `set${set}${side === "own" ? "Own" : "Opponent"}`;
}

// A score field's number, or null when it's empty or not a whole number
// from 0 to SCORE_MAX
function readScore(formData: FormData, name: string) {
    const value = String(formData.get(name) ?? "").trim();
    if (!/^\d{1,2}$/.test(value)) {
        return null;
    }
    const score = Number(value);
    return score <= SCORE_MAX ? score : null;
}

// The three sets as entered, from the player's side
export function readEnteredSets(
    formData: FormData,
): [EnteredSet, EnteredSet, EnteredSet] {
    const [set1, set2, set3] = SET_NUMBERS.map((set) => ({
        own: readScore(formData, scoreField(set, "own")),
        opponent: readScore(formData, scoreField(set, "opponent")),
    }));
    return [set1!, set2!, set3!];
}

// The date picker's "2026-10-28" as midnight UTC, like Match.playedAt
// stores it. Null if it isn't a real date or is in the future. A day after
// today in UTC is allowed, as it's already today east of UTC.
export function parsePlayedAt(value: unknown, now = new Date()) {
    const match =
        typeof value === "string"
            ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
            : null;
    if (!match) {
        return null;
    }
    const [year, month, day] = match.slice(1).map(Number) as [
        number,
        number,
        number,
    ];
    const date = new Date(Date.UTC(year, month - 1, day));
    // Rejects dates like February 30, which Date.UTC moves to March
    if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        return null;
    }
    const tomorrow = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
    );
    return date.getTime() <= tomorrow ? date : null;
}
