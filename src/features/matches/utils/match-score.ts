// Scores of best-of-three singles matches, as stored on Match (see
// src/prisma/schema.prisma). No database access, so it works on both the
// server and the client.

// The score columns of a Match
export type MatchScore = {
    set1Player1: number;
    set1Player2: number;
    set2Player1: number;
    set2Player2: number;
    set3Player1: number | null;
    set3Player2: number | null;
    set3IsMatchTiebreak: boolean;
};

export type MatchSide = "player1" | "player2";

// One set from one side: games, or points for a match tiebreak
export type SetScore = {
    own: number;
    opponent: number;
    isMatchTiebreak: boolean;
};

// The sets that were played, from `side`'s point of view
export function getSets(score: MatchScore, side: MatchSide): SetScore[] {
    const sets = [
        [score.set1Player1, score.set1Player2, false],
        [score.set2Player1, score.set2Player2, false],
    ] as [number, number, boolean][];
    if (score.set3Player1 !== null && score.set3Player2 !== null) {
        sets.push([
            score.set3Player1,
            score.set3Player2,
            score.set3IsMatchTiebreak,
        ]);
    }
    return sets.map(([player1, player2, isMatchTiebreak]) =>
        side === "player1"
            ? { own: player1, opponent: player2, isMatchTiebreak }
            : { own: player2, opponent: player1, isMatchTiebreak },
    );
}

// A finished regular set: 6 games with a lead of two (6:0 to 6:4), 7:5,
// or 7:6 after a tiebreak at 6:6
function isValidSet(a: number, b: number) {
    const [high, low] = a > b ? [a, b] : [b, a];
    return (high === 6 && low <= 4) || (high === 7 && (low === 5 || low === 6));
}

// A finished match tiebreak: first to 10 points with a lead of two, so
// 10:0 to 10:8, or 11:9, 12:10 and so on
function isValidMatchTiebreak(a: number, b: number) {
    const [high, low] = a > b ? [a, b] : [b, a];
    return high === 10 ? low <= 8 : high > 10 && high - low === 2;
}

// Who won the match by its score: whoever won two sets. The third set must
// be played exactly when the first two were split. Null if the score isn't
// a finished best-of-three match.
export function getScoreWinner(score: MatchScore): MatchSide | null {
    const sets = getSets(score, "player1");
    const [set1, set2, set3] = sets;
    if (
        !set1 ||
        !set2 ||
        !isValidSet(set1.own, set1.opponent) ||
        !isValidSet(set2.own, set2.opponent)
    ) {
        return null;
    }
    const split = set1.own > set1.opponent !== set2.own > set2.opponent;
    if (!split) {
        // A third set or a stray match tiebreak flag makes no sense here
        return set3 || score.set3IsMatchTiebreak
            ? null
            : set1.own > set1.opponent
              ? "player1"
              : "player2";
    }
    if (
        !set3 ||
        !(set3.isMatchTiebreak
            ? isValidMatchTiebreak(set3.own, set3.opponent)
            : isValidSet(set3.own, set3.opponent))
    ) {
        return null;
    }
    return set3.own > set3.opponent ? "player1" : "player2";
}

// Sets as they're usually written, e.g. "6–3" or "[10–7]" for a match
// tiebreak
export function formatSet(set: SetScore) {
    const score = `${set.own}–${set.opponent}`;
    return set.isMatchTiebreak ? `[${score}]` : score;
}

const playedAtFormat = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    // Match.playedAt is a date without a time, which arrives as midnight UTC
    timeZone: "UTC",
});

// E.g. "Oct 12, 2026"
export function formatPlayedAt(playedAt: Date) {
    return playedAtFormat.format(playedAt);
}
