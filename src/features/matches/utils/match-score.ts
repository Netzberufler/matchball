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

// Every way to win a regular set, as (winner, loser) games; isValidSet
// accepts exactly these, either way round
export const WON_SET_SCORES = [
    [6, 0],
    [6, 1],
    [6, 2],
    [6, 3],
    [6, 4],
    [7, 5],
    [7, 6],
] as const;

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

// The highest number a score field takes. Sets end at 7 games, but match
// tiebreaks can go on past 10 points.
export const SCORE_MAX = 99;
// The most games a player can win in a set (7:5 or 7:6)
export const SET_GAMES_MAX = 7;

// The highest number a set's score fields take: games in the first two
// sets, and in the third, points for a match tiebreak
export function scoreMax(set: 1 | 2 | 3) {
    return set < 3 ? SET_GAMES_MAX : SCORE_MAX;
}

// A set as entered in the form: the player's games and the opponent's
// (points for a match tiebreak), null where a field was left empty
export type EnteredSet = { own: number | null; opponent: number | null };

export type ScoreError = { set: 1 | 2 | 3; message: string };

const SET_RULE = "6:0 to 6:4, 7:5 or 7:6";

// Whether each player won one of the first two sets, so a third set
// decides the match. False while either set is incomplete or level.
export function areFirstSetsSplit([set1, set2]: EnteredSet[]) {
    if (
        !set1 ||
        !set2 ||
        set1.own === null ||
        set1.opponent === null ||
        set2.own === null ||
        set2.opponent === null ||
        set1.own === set1.opponent ||
        set2.own === set2.opponent
    ) {
        return false;
    }
    return set1.own > set1.opponent !== set2.own > set2.opponent;
}

// The three sets entered for a match as its Match columns, with the player
// who entered them as player 1, or why they aren't a finished match. A
// third set where someone reached 10 is a match tiebreak: a regular set
// never goes past 7.
export function parseEnteredScore(
    sets: [EnteredSet, EnteredSet, EnteredSet],
): { score: MatchScore; error?: never } | { score?: never; error: ScoreError } {
    for (const [index, set] of sets.entries()) {
        const number = (index + 1) as 1 | 2 | 3;
        const max = scoreMax(number);
        if ((set.own ?? 0) > max || (set.opponent ?? 0) > max) {
            return {
                error: {
                    set: number,
                    message:
                        number < 3
                            ? `A set has at most ${SET_GAMES_MAX} games`
                            : `Scores go up to ${SCORE_MAX}`,
                },
            };
        }
        if ((set.own === null) !== (set.opponent === null)) {
            return {
                error: {
                    set: number,
                    message: `Enter both scores of set ${number}`,
                },
            };
        }
        if (number < 3 && set.own === null) {
            return {
                error: {
                    set: number,
                    message: `Enter the score of set ${number}`,
                },
            };
        }
        if (number < 3 && !isValidSet(set.own ?? 0, set.opponent ?? 0)) {
            return {
                error: {
                    set: number,
                    message: `A set ends ${SET_RULE}`,
                },
            };
        }
    }

    const [set1, set2, set3] = sets as [
        { own: number; opponent: number },
        { own: number; opponent: number },
        EnteredSet,
    ];
    const split = areFirstSetsSplit(sets);
    if (!split && set3.own !== null) {
        return {
            error: {
                set: 3,
                message:
                    "The first two sets decided the match, so leave set 3 empty",
            },
        };
    }
    if (split && set3.own === null) {
        return {
            error: {
                set: 3,
                message: "The first two sets were split, so enter set 3",
            },
        };
    }
    const isMatchTiebreak =
        set3.own !== null &&
        set3.opponent !== null &&
        Math.max(set3.own, set3.opponent) >= 10;
    if (set3.own !== null && set3.opponent !== null) {
        if (
            isMatchTiebreak
                ? !isValidMatchTiebreak(set3.own, set3.opponent)
                : !isValidSet(set3.own, set3.opponent)
        ) {
            return {
                error: {
                    set: 3,
                    message: isMatchTiebreak
                        ? "A match tiebreak ends 10:0 to 10:8, or two points apart after 9:9, e.g. 11:9"
                        : `Set 3 ends ${SET_RULE}, or is a match tiebreak to 10`,
                },
            };
        }
    }

    return {
        score: {
            set1Player1: set1.own,
            set1Player2: set1.opponent,
            set2Player1: set2.own,
            set2Player2: set2.opponent,
            set3Player1: set3.own,
            set3Player2: set3.opponent,
            set3IsMatchTiebreak: isMatchTiebreak,
        },
    };
}

// A set as the app shows it, e.g. "6:3", or "10:7" for a match tiebreak
export function formatSet(set: SetScore) {
    return `${set.own}:${set.opponent}`;
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

const playedOnFormat = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
});

// The day and the year apart, e.g. "Oct 12" and "2026", for narrow columns
export function formatPlayedAtParts(playedAt: Date) {
    return {
        day: playedOnFormat.format(playedAt),
        year: String(playedAt.getUTCFullYear()),
    };
}
