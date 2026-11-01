// Shared by the challenge popup, which checks the deadline before sending
// it, and the challenge actions, which check everything again before
// saving.

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// The deadline is at least this many days away when a challenge is made
export const MIN_DEADLINE_DAYS = 2;
// The popup starts with a deadline this many days away
export const DEFAULT_DEADLINE_DAYS = 7;
// And it can't be later than this
export const MAX_DEADLINE_DAYS = 60;
// After a declined challenge, the challenger can't challenge the same user
// again for this many days, so nobody is flooded with challenges
export const CHALLENGE_COOLDOWN_DAYS = 3;

// The server allows a deadline this much earlier than the minimum, for
// the time between choosing it in the popup and sending it
const DEADLINE_GRACE_MS = 15 * 60 * 1000;

export const DEADLINE_TOO_SOON_MESSAGE = `Choose a deadline at least ${MIN_DEADLINE_DAYS} days from now`;
export const DEADLINE_TOO_LATE_MESSAGE = `Choose a deadline within ${MAX_DEADLINE_DAYS} days`;

// Why `deadline` can't be a new challenge's deadline at `now`, or null if
// it can
export function checkDeadline(deadline: Date, now: Date): string | null {
    const away = deadline.getTime() - now.getTime();
    if (away < MIN_DEADLINE_DAYS * DAY_MS - DEADLINE_GRACE_MS) {
        return DEADLINE_TOO_SOON_MESSAGE;
    }
    if (away > MAX_DEADLINE_DAYS * DAY_MS) {
        return DEADLINE_TOO_LATE_MESSAGE;
    }
    return null;
}

// Challenges declined after this time still keep their challenger from
// challenging the same user again
export function cooldownStart(now: Date) {
    return new Date(now.getTime() - CHALLENGE_COOLDOWN_DAYS * DAY_MS);
}

// When a challenge declined at `answeredAt` stops keeping its challenger
// from challenging the same user again
export function cooldownEnd(answeredAt: Date) {
    return new Date(answeredAt.getTime() + CHALLENGE_COOLDOWN_DAYS * DAY_MS);
}

// How long until `until`, for "You can challenge them again in 2 days":
// whole days from a day on, otherwise hours, rounded up
export function formatWaitTime(until: Date, now: Date) {
    const away = Math.max(until.getTime() - now.getTime(), 0);
    if (away >= DAY_MS) {
        const days = Math.ceil(away / DAY_MS);
        return `in ${days} ${days === 1 ? "day" : "days"}`;
    }
    const hours = Math.max(Math.ceil(away / HOUR_MS), 1);
    return `in ${hours} ${hours === 1 ? "hour" : "hours"}`;
}

// Challenge.activePair of two users, the same whoever challenges whom
export function challengePair(userId: string, otherUserId: string) {
    return userId < otherUserId
        ? `${userId}:${otherUserId}`
        : `${otherUserId}:${userId}`;
}

// A challenge's status as the table shows it. An open challenge whose
// deadline has passed is expired, whether or not that's stored yet.
export type ChallengeState =
    "open" | "accepted" | "declined" | "withdrawn" | "expired" | "played";

export function challengeState(
    status:
        "OPEN" | "ACCEPTED" | "DECLINED" | "WITHDRAWN" | "EXPIRED" | "PLAYED",
    deadline: Date,
    now: Date,
): ChallengeState {
    if (status === "OPEN" && deadline.getTime() <= now.getTime()) {
        return "expired";
    }
    return status.toLowerCase() as ChallengeState;
}
