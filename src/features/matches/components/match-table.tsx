"use client";

import Link from "next/link";
import { Card, EmptyState, Skeleton, Table } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { UserMatch } from "@/features/matches/lib/queries";
import {
    formatPlayedAt,
    formatSet,
} from "@/features/matches/utils/match-score";
import { profilePath } from "@/features/profile/utils/profile-path";

// The viewer's matches, newest first: when, both players (the viewer
// first) and the score from the viewer's side. A green or red bar left of
// the score shows whether they won. Without `matches` (while they load), it
// shows placeholder rows.
export function MatchTable({ matches }: { matches: UserMatch[] | null }) {
    if (matches?.length === 0) {
        return (
            <Card>
                <EmptyState className="text-center">No matches yet.</EmptyState>
            </Card>
        );
    }

    return (
        <Table>
            <Table.ScrollContainer>
                <Table.Content
                    aria-label="Your latest matches"
                    className="text-sm sm:min-w-[32rem]"
                >
                    <Table.Header>
                        {/* On phones the date and the player move into the
                            opponent's cell, so the score fits without
                            scrolling */}
                        <Table.Column className={WIDE_ONLY_CLASS}>
                            Date
                        </Table.Column>
                        <Table.Column className={WIDE_ONLY_CLASS}>
                            Player
                        </Table.Column>
                        <Table.Column isRowHeader>
                            <span className="sm:hidden">Players</span>
                            <span className="max-sm:hidden">Opponent</span>
                        </Table.Column>
                        <Table.Column className={SCORE_COLUMN_CLASS}>
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
                                                column < 2
                                                    ? WIDE_ONLY_CLASS
                                                    : undefined
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
    );
}

function MatchRow({ match }: { match: UserMatch }) {
    return (
        <Table.Row id={match.id}>
            <Table.Cell
                className={`whitespace-nowrap text-muted ${WIDE_ONLY_CLASS}`}
            >
                {formatPlayedAt(match.playedAt)}
            </Table.Cell>
            <Table.Cell className={WIDE_ONLY_CLASS}>
                <PlayerLink user={match.player} />
            </Table.Cell>
            <Table.Cell>
                <span className="flex min-w-0 flex-col gap-1 max-sm:max-w-36">
                    <span className="sm:hidden">
                        <PlayerLink user={match.player} />
                    </span>
                    <PlayerLink user={match.opponent} />
                    <span className="text-xs text-muted sm:hidden">
                        {formatPlayedAt(match.playedAt)}
                    </span>
                </span>
            </Table.Cell>
            <Table.Cell className={SCORE_COLUMN_CLASS}>
                <span
                    className={`flex gap-1.5 whitespace-nowrap border-l-4 pl-2 tabular-nums sm:gap-3 ${
                        match.won ? "border-l-success" : "border-l-danger"
                    }`}
                >
                    {/* The bar's colour, for screen readers */}
                    <span className="sr-only">
                        {match.won ? "Won" : "Lost"}:
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
            </Table.Cell>
        </Table.Row>
    );
}

// A player's avatar, name and username, linking to their profile
function PlayerLink({ user }: { user: UserMatch["player"] }) {
    return (
        <Link
            href={profilePath(user.username)}
            className="flex min-w-0 items-center gap-2 hover:underline"
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

// Hides the date and player columns below the sm breakpoint
const WIDE_ONLY_CLASS = "max-sm:hidden";
// Room for three sets with a match tiebreak. On smaller screens the
// column takes what's left.
const SCORE_COLUMN_CLASS = "md:min-w-36";

const PLACEHOLDER_ROWS = Array.from({ length: 5 }, (_, index) => ({
    id: index,
}));

// Shown while the matches load; the shape of MatchTable
export function MatchTableFallback() {
    return <MatchTable matches={null} />;
}
