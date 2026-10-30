"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Card,
    EmptyState,
    RouterProvider,
    Skeleton,
    Table,
} from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { UserMatch } from "@/features/matches/lib/queries";
import {
    formatPlayedAt,
    formatPlayedAtParts,
    formatSet,
} from "@/features/matches/utils/match-score";
import { profilePath } from "@/features/profile/utils/profile-path";

// A player's matches, newest first: when, both players (theirs first) and
// the score from their side. A green or red bar left of the score shows
// whether they won. Each row leads to the match's page,
// except clicks on the players, which lead to their profiles. Without `matches` (while they load), it
// shows placeholder rows.
export function MatchTable({
    matches,
    label = "Your latest matches",
    emptyMessage = "No matches yet.",
}: {
    matches: UserMatch[] | null;
    // For screen readers
    label?: string;
    emptyMessage?: string;
}) {
    const router = useRouter();

    if (matches?.length === 0) {
        return (
            <Card>
                <EmptyState className="text-center">{emptyMessage}</EmptyState>
            </Card>
        );
    }

    // Rows with an href navigate through React Aria, which this hands to
    // the Next.js router instead of a full page load
    return (
        <RouterProvider navigate={router.push}>
            <Table>
                <Table.ScrollContainer>
                    <Table.Content
                        aria-label={label}
                        className="text-sm sm:min-w-[32rem]"
                    >
                        <Table.Header>
                            <Table.Column className={CELL_CLASS}>
                                Date
                            </Table.Column>
                            {/* Always the same player, so phones leave it out to
                            fit the score without scrolling */}
                            <Table.Column className={WIDE_ONLY_CLASS}>
                                Player
                            </Table.Column>
                            <Table.Column isRowHeader className={CELL_CLASS}>
                                Opponent
                            </Table.Column>
                            <Table.Column
                                className={`${SCORE_COLUMN_CLASS} ${CELL_CLASS}`}
                            >
                                Score
                            </Table.Column>
                        </Table.Header>
                        {matches ? (
                            <Table.Body items={matches}>
                                {(match) => <MatchRow match={match} />}
                            </Table.Body>
                        ) : (
                            <Table.Body items={PLACEHOLDER_ROWS}>
                                {(row) => (
                                    <Table.Row id={row.id}>
                                        {[0, 1, 2, 3].map((column) => (
                                            <Table.Cell
                                                key={column}
                                                className={
                                                    column === 1
                                                        ? WIDE_ONLY_CLASS
                                                        : CELL_CLASS
                                                }
                                            >
                                                <Skeleton className="h-4 w-20 rounded-lg" />
                                            </Table.Cell>
                                        ))}
                                    </Table.Row>
                                )}
                            </Table.Body>
                        )}
                    </Table.Content>
                </Table.ScrollContainer>
            </Table>
        </RouterProvider>
    );
}

function MatchRow({ match }: { match: UserMatch }) {
    return (
        <Table.Row
            id={match.id}
            href={`/matches/${match.id}`}
            className="cursor-pointer"
        >
            <Table.Cell
                className={`whitespace-nowrap text-muted ${CELL_CLASS}`}
            >
                <PlayedAt playedAt={match.playedAt} />
            </Table.Cell>
            <Table.Cell className={WIDE_ONLY_CLASS}>
                <PlayerLink user={match.player} />
            </Table.Cell>
            <Table.Cell className={CELL_CLASS}>
                {/* Long names end in "…" on phones, so the score fits */}
                <span className="block max-sm:max-w-28">
                    <PlayerLink user={match.opponent} />
                </span>
            </Table.Cell>
            <Table.Cell className={`${SCORE_COLUMN_CLASS} ${CELL_CLASS}`}>
                <MatchScore match={match} />
            </Table.Cell>
        </Table.Row>
    );
}

// The sets from the player's side, with a bar on the left: green if they
// won, red if they lost. Pending matches show it too, as the result that
// counts once the match is confirmed.
export function MatchScore({
    match,
    isPending = false,
}: {
    match: UserMatch;
    isPending?: boolean;
}) {
    const result = match.won ? "Won" : "Lost";
    return (
        <span
            className={`flex gap-1.5 whitespace-nowrap border-l-4 pl-2 tabular-nums sm:gap-3 ${
                match.won ? "border-l-success" : "border-l-danger"
            }`}
        >
            {/* The bar's meaning, for screen readers */}
            <span className="sr-only">
                {isPending ? `${result} if confirmed` : result}:
            </span>
            {match.sets.map((set, index) => (
                <span
                    key={index}
                    // Sets the player won stand out
                    className={
                        set.own > set.opponent
                            ? "font-semibold text-foreground"
                            : "text-muted"
                    }
                >
                    {formatSet(set)}
                </span>
            ))}
        </span>
    );
}

// When the match was played: "Oct 26, 2026", or on phones "Oct 26" with the
// year below
function PlayedAt({ playedAt }: { playedAt: Date }) {
    const { day, year } = formatPlayedAtParts(playedAt);
    return (
        <>
            <span className="max-sm:hidden">{formatPlayedAt(playedAt)}</span>
            <span className="flex flex-col sm:hidden">
                {day}
                <span className="text-xs">{year}</span>
            </span>
        </>
    );
}

// A player's avatar, name and username, linking to their profile
export function PlayerLink({ user }: { user: UserMatch["player"] }) {
    return (
        <Link
            href={profilePath(user.username)}
            className="flex min-w-0 items-center gap-2 hover:underline"
            // Inside a row that links to the match, React Aria would take
            // the press (and Enter) for the row, so keep them to this link
            onPointerDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
        >
            {/* Both players' avatars only fit next to a three-set score
                on wide screens */}
            <span className="max-lg:hidden">
                <UserAvatar name={user.name} image={user.image} size="sm" />
            </span>
            <span className="flex min-w-0 flex-col">
                <span className="truncate font-semibold text-foreground">
                    {user.name}
                </span>
                {/* Spaces the link text for screen readers */}{" "}
                <span className="truncate text-xs text-muted">
                    @{user.username}
                </span>
            </span>
        </Link>
    );
}

// Hides the player column below the sm breakpoint
const WIDE_ONLY_CLASS = "max-sm:hidden";
// Less padding on phones, for the score's sake
const CELL_CLASS = "max-sm:px-3";
// Room for three sets with a match tiebreak. On smaller screens the
// column takes what's left.
const SCORE_COLUMN_CLASS = "md:min-w-36";

const PLACEHOLDER_ROWS = Array.from({ length: 5 }, (_, index) => ({
    id: index,
}));
