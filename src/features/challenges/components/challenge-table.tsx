"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
    AlertDialog,
    Button,
    buttonVariants,
    Chip,
    Skeleton,
    Table,
} from "@heroui/react";
import { OpponentFilterMenu } from "@/components/ui/filter-menus";
import { EmptyCard, RetryCard } from "@/components/ui/list-card";
import { LoadMore } from "@/components/ui/load-more";
import {
    acceptChallenge,
    declineChallenge,
    withdrawChallenge,
} from "@/features/challenges/actions/answer-challenge";
import { loadChallenges } from "@/features/challenges/actions/load-challenges";
import type { ChallengeItem } from "@/features/challenges/lib/queries";
import {
    type ChallengeFilters,
    challengeFiltersKey,
    countActiveChallengeFilters,
    NO_CHALLENGE_FILTERS,
} from "@/features/challenges/utils/challenge-filters";
import type { ChallengeState } from "@/features/challenges/utils/challenge-rules";
import { PlayerLink } from "@/features/matches/components/match-table";
import {
    logChallengeMatchPath,
    MATCHES_PATH,
    matchPath,
} from "@/features/matches/utils/match-path";
import type { PublicUser } from "@/features/profile/utils/public-user";
import {
    appendPage,
    type FeedPage,
    mergeLatestPage,
    replaceItems,
} from "@/features/posts/utils/feed";
import { useOnDemand } from "@/lib/use-on-demand";
import { useLoadMore } from "@/lib/use-paged-list";
import { ChallengeStatusMenu } from "./challenge-status-menu";

type Page = FeedPage<ChallengeItem>;

// What the server sends with the page
const NO_FILTERS_KEY = challengeFiltersKey(NO_CHALLENGE_FILTERS);

// The signed-in user's challenges, made and received, newest first, with
// buttons to filter them by status and opponent, and more loaded on
// request. Each row shows what the user can do with it now: accept or
// decline one they received, withdraw one they made, log the match of an
// accepted one, or see the result once it's played.
// The filters run in the database: the unfiltered list starts with
// `firstPage`, and each combination of filters loads its first page when
// it's first set, and keeps what it loaded while switching back and forth.
// A refreshed page brings a new `firstPage`, merged into the unfiltered
// list; the others load theirs again (see useOnDemand).
// `opponents` is everyone the user shares a challenge with.
export function ChallengeTable({
    firstPage,
    opponents,
}: {
    firstPage: Page;
    opponents: { user: PublicUser; count: number }[];
}) {
    const [filters, setFilters] =
        useState<ChallengeFilters>(NO_CHALLENGE_FILTERS);
    const shownKey = challengeFiltersKey(filters);
    const pages = useOnDemand<string, Page>({
        // A key is the filters as JSON (see challengeFiltersKey)
        load: (key) => loadChallenges(JSON.parse(key), null),
        shownKey,
        refreshKey: firstPage,
        initial: { [NO_FILTERS_KEY]: firstPage },
        merge: mergeLatestPage,
    });
    const page = pages.data(shownKey);
    const isFiltered = countActiveChallengeFilters(filters) > 0;

    function changeFilters(next: ChallengeFilters) {
        setFilters(next);
        pages.open(challengeFiltersKey(next));
    }

    // Without any challenges there's nothing to filter
    if (opponents.length === 0 && firstPage.items.length === 0) {
        return (
            <EmptyCard>
                No challenges yet. Challenge someone to a match.
            </EmptyCard>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <ChallengeStatusMenu
                    statuses={filters.statuses}
                    onChange={(statuses) =>
                        changeFilters({ ...filters, statuses })
                    }
                />
                <OpponentFilterMenu
                    opponentIds={filters.opponentIds}
                    onChange={(opponentIds) =>
                        changeFilters({ ...filters, opponentIds })
                    }
                    opponents={opponents}
                />
                {isFiltered && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => changeFilters(NO_CHALLENGE_FILTERS)}
                    >
                        Clear filters
                    </Button>
                )}
            </div>
            {page ? (
                // Keyed, so "Load more" starts over for other filters
                <ChallengeList
                    key={shownKey}
                    filters={filters}
                    page={page}
                    emptyMessage={
                        isFiltered
                            ? "No challenges fit these filters."
                            : "No challenges yet. Challenge someone to a match."
                    }
                    onPageChange={(change) => pages.update(shownKey, change)}
                />
            ) : pages.failed(shownKey) ? (
                <RetryCard
                    message="Couldn't load these challenges."
                    onRetry={() => pages.open(shownKey)}
                />
            ) : (
                <ChallengeTableContent challenges={null} onChanged={() => {}} />
            )}
        </div>
    );
}

// The challenges `filters` show, with "Load more" below
function ChallengeList({
    filters,
    page,
    emptyMessage,
    onPageChange,
}: {
    filters: ChallengeFilters;
    page: Page;
    emptyMessage: string;
    onPageChange: (change: (page: Page) => Page) => void;
}) {
    const { loadMore, isPending, error } = useLoadMore({
        cursor: page.nextCursor,
        load: (cursor) => loadChallenges(filters, cursor),
        onLoaded: (next) =>
            onPageChange((current) => appendPage(current, next)),
        errorMessage: "Couldn't load more challenges. Please try again.",
    });

    // After an answer: the row as it is now, also on pages further down,
    // which the refresh doesn't reach
    function onChanged(challenge: ChallengeItem) {
        onPageChange((current) => ({
            ...current,
            items: replaceItems(current.items, [challenge]),
        }));
    }

    if (page.items.length === 0) {
        return <EmptyCard>{emptyMessage}</EmptyCard>;
    }

    return (
        <div className="flex flex-col gap-4">
            <ChallengeTableContent
                challenges={page.items}
                onChanged={onChanged}
            />
            {page.nextCursor && (
                <LoadMore
                    isPending={isPending}
                    onPress={loadMore}
                    error={error}
                    loadingLabel="Loading more challenges"
                />
            )}
        </div>
    );
}

// Placeholder rows while the challenges load
export function ChallengeTableFallback() {
    return <ChallengeTableContent challenges={null} onChanged={() => {}} />;
}

function ChallengeTableContent({
    challenges,
    onChanged,
}: {
    challenges: ChallengeItem[] | null;
    onChanged: (challenge: ChallengeItem) => void;
}) {
    return (
        <Table>
            <Table.ScrollContainer>
                <Table.Content
                    aria-label="Your challenges"
                    className="min-w-[32rem] text-sm"
                >
                    <Table.Header>
                        <Table.Column>Date</Table.Column>
                        <Table.Column>Status</Table.Column>
                        <Table.Column isRowHeader>Opponent</Table.Column>
                        <Table.Column>Deadline</Table.Column>
                        <Table.Column>Actions</Table.Column>
                    </Table.Header>
                    {challenges ? (
                        <Table.Body items={challenges}>
                            {(challenge) => (
                                <ChallengeRow
                                    challenge={challenge}
                                    onChanged={onChanged}
                                />
                            )}
                        </Table.Body>
                    ) : (
                        <Table.Body items={PLACEHOLDER_ROWS}>
                            {(row) => (
                                <Table.Row id={row.id}>
                                    {[0, 1, 2, 3, 4].map((column) => (
                                        <Table.Cell key={column}>
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

function ChallengeRow({
    challenge,
    onChanged,
}: {
    challenge: ChallengeItem;
    onChanged: (challenge: ChallengeItem) => void;
}) {
    return (
        <Table.Row id={challenge.id}>
            <Table.Cell className="whitespace-nowrap text-muted">
                <LocalTime date={challenge.createdAt} format={dateFormat} />
            </Table.Cell>
            <Table.Cell>
                <StatusChip state={challenge.state} won={challenge.won} />
                {/* Who challenged whom, below the status */}{" "}
                <span className="mt-1 block whitespace-nowrap text-xs text-muted">
                    {challenge.isChallenger
                        ? "You challenged"
                        : "Challenged by"}
                </span>
            </Table.Cell>
            <Table.Cell>
                <PlayerLink user={challenge.opponent} />
            </Table.Cell>
            <Table.Cell className="whitespace-nowrap text-muted">
                <LocalTime date={challenge.deadline} format={dateFormat} />
                {/* Below the day, so the column stays narrow */}
                <span className="block text-xs">
                    <LocalTime date={challenge.deadline} format={timeFormat} />
                </span>
            </Table.Cell>
            <Table.Cell>
                <ChallengeActions challenge={challenge} onChanged={onChanged} />
            </Table.Cell>
        </Table.Row>
    );
}

const STATUS_CHIPS: Record<
    ChallengeState,
    {
        label: string;
        color: "accent" | "success" | "danger" | "warning" | "default";
    }
> = {
    open: { label: "Open", color: "accent" },
    accepted: { label: "Accepted", color: "success" },
    declined: { label: "Declined", color: "danger" },
    withdrawn: { label: "Withdrawn", color: "default" },
    expired: { label: "Passed", color: "warning" },
    played: { label: "Played", color: "default" },
};

// A played challenge shows how its match went for the viewer instead
const RESULT_CHIPS = {
    won: { label: "Won", color: "success" },
    lost: { label: "Lost", color: "danger" },
} as const;

function StatusChip({
    state,
    won,
}: {
    state: ChallengeState;
    won: boolean | null;
}) {
    const { label, color } =
        won === null ? STATUS_CHIPS[state] : RESULT_CHIPS[won ? "won" : "lost"];
    return (
        <Chip size="sm" variant="soft" color={color}>
            {label}
        </Chip>
    );
}

// What the viewer can do with the challenge now
function ChallengeActions({
    challenge,
    onChanged,
}: {
    challenge: ChallengeItem;
    onChanged: (challenge: ChallengeItem) => void;
}) {
    const [error, setError] = useState<string | null>(null);
    const [isAccepting, startAccept] = useTransition();
    const [isRemoving, startRemove] = useTransition();
    const isBusy = isAccepting || isRemoving;
    const { state, isChallenger, matchId } = challenge;
    const opponentName = challenge.opponent.name;

    function run(
        start: React.TransitionStartFunction,
        action: typeof acceptChallenge,
    ) {
        setError(null);
        start(async () => {
            const result = await action(challenge.id);
            setError(result.error);
            if (result.challenge) {
                onChanged(result.challenge);
            }
        });
    }

    const canAnswer = state === "open" && !isChallenger;
    // Only while open: once accepted, it's on
    const canWithdraw = state === "open" && isChallenger;
    const canLogMatch = state === "accepted" && !matchId;

    let content: React.ReactNode;
    if (state === "played" && matchId) {
        content = (
            // A link styled as a HeroUI button
            <Link
                href={matchPath(matchId)}
                className={buttonVariants({ size: "sm", variant: "tertiary" })}
            >
                View match
            </Link>
        );
    } else if (state === "accepted" && matchId) {
        // Logged, waiting for the other player to confirm it on /matches
        content = challenge.mustConfirmMatch ? (
            <Link
                href={MATCHES_PATH}
                className={buttonVariants({ size: "sm", variant: "primary" })}
            >
                Confirm result
            </Link>
        ) : (
            <span className="text-muted">Result pending</span>
        );
    } else if (canAnswer || canWithdraw || canLogMatch) {
        content = (
            <>
                {canAnswer && (
                    <Button
                        size="sm"
                        variant="primary"
                        isPending={isAccepting}
                        isDisabled={isBusy}
                        onPress={() => run(startAccept, acceptChallenge)}
                    >
                        Accept
                    </Button>
                )}
                {canLogMatch && (
                    // A link styled as a HeroUI button
                    <Link
                        href={logChallengeMatchPath(challenge.id)}
                        aria-disabled={isBusy}
                        className={`${buttonVariants({
                            size: "sm",
                            variant: "primary",
                        })} ${isBusy ? "pointer-events-none opacity-50" : ""}`}
                    >
                        Log match
                    </Link>
                )}
                {(canAnswer || canWithdraw) && (
                    <ConfirmButton
                        label={canAnswer ? "Decline" : "Withdraw"}
                        heading={
                            canAnswer
                                ? "Decline this challenge?"
                                : "Withdraw this challenge?"
                        }
                        message={
                            canAnswer
                                ? `${opponentName} sees that you declined, and can't challenge you again for a few days.`
                                : `The challenge to ${opponentName} ends. You can challenge them again any time.`
                        }
                        isPending={isRemoving}
                        isDisabled={isBusy}
                        onConfirm={() =>
                            run(
                                startRemove,
                                canAnswer
                                    ? declineChallenge
                                    : withdrawChallenge,
                            )
                        }
                    />
                )}
            </>
        );
    } else {
        content = (
            <span className="text-muted" aria-label="Nothing to do">
                –
            </span>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">{content}</div>
            {error && (
                <p role="alert" className="max-w-56 text-xs text-danger">
                    {error}
                </p>
            )}
        </div>
    );
}

// A button that asks first, e.g. "Decline", as it can't be undone. The
// dialog stays open until the action is done.
function ConfirmButton({
    label,
    heading,
    message,
    isPending,
    isDisabled,
    onConfirm,
}: {
    label: string;
    heading: string;
    message: string;
    isPending: boolean;
    isDisabled: boolean;
    onConfirm: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    // Closes once the action is done
    const [wasPending, setWasPending] = useState(false);
    if (isPending !== wasPending) {
        setWasPending(isPending);
        if (!isPending) {
            setIsOpen(false);
        }
    }

    return (
        <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button size="sm" variant="danger-soft" isDisabled={isDisabled}>
                {label}
            </Button>
            <AlertDialog.Backdrop>
                <AlertDialog.Container size="sm">
                    <AlertDialog.Dialog>
                        <AlertDialog.Header>
                            <AlertDialog.Icon status="danger" />
                            <AlertDialog.Heading>{heading}</AlertDialog.Heading>
                        </AlertDialog.Header>
                        <AlertDialog.Body>
                            <p>{message}</p>
                        </AlertDialog.Body>
                        <AlertDialog.Footer>
                            <Button
                                variant="tertiary"
                                isDisabled={isPending}
                                onPress={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                isPending={isPending}
                                onPress={onConfirm}
                            >
                                {label}
                            </Button>
                        </AlertDialog.Footer>
                    </AlertDialog.Dialog>
                </AlertDialog.Container>
            </AlertDialog.Backdrop>
        </AlertDialog>
    );
}

// In the user's time zone, e.g. "Nov 1, 2026"
const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });
// E.g. "14:00"
const timeFormat = new Intl.DateTimeFormat("en", {
    timeStyle: "short",
    hourCycle: "h23",
});

// A date in the user's time zone. The server renders it in its own, so
// React doesn't warn when the browser's differs.
function LocalTime({
    date,
    format,
}: {
    date: Date;
    format: Intl.DateTimeFormat;
}) {
    return (
        <time suppressHydrationWarning dateTime={date.toISOString()}>
            {format.format(date)}
        </time>
    );
}

const PLACEHOLDER_ROWS = Array.from({ length: 5 }, (_, index) => ({
    id: index,
}));
