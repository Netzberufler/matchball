"use client";

import Link from "next/link";
import { Card, Chip, EmptyState, Skeleton, Table } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { UserMatch } from "@/features/matches/lib/queries";
import {
    formatPlayedAt,
    formatSet,
} from "@/features/matches/utils/match-score";
import { profilePath } from "@/features/profile/utils/profile-path";

// The viewer's matches, newest first: when, against whom, whether they won,
// and the score from their side. Without `matches` (while they load), it
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
                    className="sm:min-w-[32rem]"
                >
                    <Table.Header>
                        {/* On phones the date moves under the opponent's
                            name, so the score fits without scrolling */}
                        <Table.Column className={DATE_COLUMN_CLASS}>
                            Date
                        </Table.Column>
                        <Table.Column isRowHeader>Opponent</Table.Column>
                        <Table.Column>Result</Table.Column>
                        <Table.Column>Score</Table.Column>
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
                                                column === 0
                                                    ? DATE_COLUMN_CLASS
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
                className={`whitespace-nowrap text-muted ${DATE_COLUMN_CLASS}`}
            >
                {formatPlayedAt(match.playedAt)}
            </Table.Cell>
            <Table.Cell>
                <Link
                    href={profilePath(match.opponent.username)}
                    className="flex min-w-0 items-center gap-3 hover:underline"
                >
                    {/* No room for it next to three sets on phones */}
                    <span className="max-sm:hidden">
                        <UserAvatar
                            name={match.opponent.name}
                            image={match.opponent.image}
                        />
                    </span>
                    <span className="flex min-w-0 flex-col">
                        <span className="truncate font-semibold text-foreground">
                            {match.opponent.name}
                        </span>
                        <span className="text-sm text-muted sm:hidden">
                            {formatPlayedAt(match.playedAt)}
                        </span>
                    </span>
                </Link>
            </Table.Cell>
            <Table.Cell>
                <Chip
                    size="sm"
                    variant="soft"
                    color={match.won ? "success" : "danger"}
                >
                    {match.won ? "Won" : "Lost"}
                </Chip>
            </Table.Cell>
            <Table.Cell>
                <span className="flex gap-2 whitespace-nowrap tabular-nums sm:gap-3">
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

// Hides the date column below the sm breakpoint
const DATE_COLUMN_CLASS = "max-sm:hidden";

const PLACEHOLDER_ROWS = Array.from({ length: 5 }, (_, index) => ({
    id: index,
}));

// Shown while the matches load; the shape of MatchTable
export function MatchTableFallback() {
    return <MatchTable matches={null} />;
}
