"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownUp, Check, Plus, Trophy, Users } from "lucide-react";
import { Button, buttonVariants, Chip, Dropdown, Label } from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { UserMatch } from "@/features/matches/lib/queries";
import {
    countActiveFilters,
    filterAndSortMatches,
    getOpponents,
    MATCH_RESULT_FILTERS,
    MATCH_SORT_ORDERS,
    NO_MATCH_FILTERS,
    type MatchFilters,
    type MatchResultFilter,
    type MatchSortOrder,
} from "@/features/matches/utils/match-filters";
import { MatchTable } from "./match-table";

// All of a player's confirmed matches, with how many there are, buttons to
// sort them by date and filter them by opponent and result, and a link to
// add one. The
// filters run here, on the matches already loaded.
export function FilterableMatchTable({ matches }: { matches: UserMatch[] }) {
    const [filters, setFilters] = useState<MatchFilters>(NO_MATCH_FILTERS);
    const [order, setOrder] = useState<MatchSortOrder>("newest");
    const opponents = useMemo(() => getOpponents(matches), [matches]);
    const shown = useMemo(
        () => filterAndSortMatches(matches, filters, order),
        [matches, filters, order],
    );
    const activeFilters = countActiveFilters(filters);

    return (
        <section className="flex flex-col gap-3">
            <MatchesHeading
                count={
                    activeFilters > 0
                        ? `${shown.length} of ${matches.length}`
                        : matches.length
                }
            />
            <div className="flex flex-wrap items-center gap-2">
                {matches.length > 0 && (
                    <>
                        <SortMenu order={order} onChange={setOrder} />
                        <OpponentMenu
                            opponentIds={filters.opponentIds}
                            onChange={(opponentIds) =>
                                setFilters({ ...filters, opponentIds })
                            }
                            opponents={opponents}
                        />
                        <ResultMenu
                            result={filters.result}
                            onChange={(result) =>
                                setFilters({ ...filters, result })
                            }
                        />
                        {activeFilters > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onPress={() => setFilters(NO_MATCH_FILTERS)}
                            >
                                Clear filters
                            </Button>
                        )}
                    </>
                )}
                <AddMatchLink />
            </div>
            <MatchTable
                matches={shown}
                emptyMessage={
                    matches.length > 0
                        ? "No matches fit these filters."
                        : undefined
                }
            />
        </section>
    );
}

// To /matches/add, at the right end of the buttons above the table
export function AddMatchLink() {
    return (
        // A link styled as a HeroUI button
        <Link
            href="/matches/add"
            className={`ml-auto ${buttonVariants({ variant: "primary", size: "sm" })}`}
        >
            <Plus className="size-4" aria-hidden />
            {/* Just the plus on phones, so it fits next to the other
                buttons */}
            <span className="max-sm:sr-only">Add new</span>
        </Link>
    );
}

// "All matches" and how many, e.g. "32" or, while filtered, "5 of 32".
// Without a count (while they load) only the heading.
export function MatchesHeading({ count }: { count?: number | string }) {
    return (
        <h2 className="flex items-center gap-2 text-base font-semibold">
            All matches
            {count !== undefined && (
                <Chip size="sm" variant="secondary">
                    {count}
                </Chip>
            )}
        </h2>
    );
}

// Any number of opponents, in a menu that stays open while ticking them.
// The button shows how many are ticked.
function OpponentMenu({
    opponentIds,
    onChange,
    opponents,
}: {
    opponentIds: string[];
    onChange: (opponentIds: string[]) => void;
    opponents: ReturnType<typeof getOpponents<UserMatch["opponent"]>>;
}) {
    return (
        <Dropdown>
            <Button variant="tertiary" size="sm">
                <Users className="size-4" aria-hidden />
                Opponents
                {opponentIds.length > 0 && (
                    <Chip size="sm" color="accent" variant="primary">
                        {opponentIds.length}
                    </Chip>
                )}
            </Button>
            <Dropdown.Popover placement="bottom start" className="min-w-56">
                <Dropdown.Menu
                    aria-label="Filter by opponent"
                    selectionMode="multiple"
                    selectedKeys={opponentIds}
                    onSelectionChange={(keys) =>
                        onChange(
                            // The menu never selects "all" by itself
                            keys === "all"
                                ? opponents.map(({ user }) => user.id)
                                : [...keys].map(String),
                        )
                    }
                    shouldCloseOnSelect={false}
                    className="max-h-96 overflow-y-auto"
                >
                    {opponents.map(({ user, matchCount }) => (
                        <Dropdown.Item
                            key={user.id}
                            id={user.id}
                            textValue={user.name}
                        >
                            {/* A checkbox look, so opponents read as
                                something to tick, not one choice */}
                            <Dropdown.ItemIndicator>
                                {({ isSelected }) => (
                                    <span
                                        className={`flex size-4 items-center justify-center rounded border ${
                                            isSelected
                                                ? "border-accent bg-accent text-accent-foreground"
                                                : "border-border bg-field"
                                        }`}
                                    >
                                        {isSelected && (
                                            <Check
                                                className="size-3"
                                                strokeWidth={3}
                                                aria-hidden
                                            />
                                        )}
                                    </span>
                                )}
                            </Dropdown.ItemIndicator>
                            <UserAvatar
                                name={user.name}
                                image={user.image}
                                size="sm"
                            />
                            <span className="flex min-w-0 flex-1 flex-col">
                                <Label className="truncate">{user.name}</Label>
                                <span className="truncate text-xs text-muted">
                                    @{user.username}
                                </span>
                            </span>
                            <span className="text-xs text-muted tabular-nums">
                                {matchCount}
                            </span>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}

// All, won or lost. The button shows the choice unless it's all.
function ResultMenu({
    result,
    onChange,
}: {
    result: MatchResultFilter;
    onChange: (result: MatchResultFilter) => void;
}) {
    const label = MATCH_RESULT_FILTERS.find(
        (option) => option.key === result,
    )?.label;
    return (
        <Dropdown>
            <Button variant="tertiary" size="sm">
                <Trophy className="size-4" aria-hidden />
                Result
                {result !== "all" && (
                    <Chip size="sm" color="accent" variant="primary">
                        {label}
                    </Chip>
                )}
            </Button>
            <Dropdown.Popover placement="bottom start">
                <Dropdown.Menu
                    aria-label="Filter by result"
                    selectionMode="single"
                    disallowEmptySelection
                    selectedKeys={[result]}
                    onSelectionChange={(keys) => {
                        const [next] = keys as Set<MatchResultFilter>;
                        if (next) {
                            onChange(next);
                        }
                    }}
                >
                    {MATCH_RESULT_FILTERS.map((option) => (
                        <Dropdown.Item
                            key={option.key}
                            id={option.key}
                            textValue={option.label}
                        >
                            <Dropdown.ItemIndicator type="dot" />
                            <Label>{option.label}</Label>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}

// Newest or oldest first
function SortMenu({
    order,
    onChange,
}: {
    order: MatchSortOrder;
    onChange: (order: MatchSortOrder) => void;
}) {
    return (
        <Dropdown>
            <Button variant="tertiary" size="sm">
                <ArrowDownUp className="size-4" aria-hidden />
                Sort
            </Button>
            <Dropdown.Popover placement="bottom start">
                <Dropdown.Menu
                    aria-label="Sort matches"
                    selectionMode="single"
                    disallowEmptySelection
                    selectedKeys={[order]}
                    onSelectionChange={(keys) => {
                        const [next] = keys as Set<MatchSortOrder>;
                        if (next) {
                            onChange(next);
                        }
                    }}
                >
                    {MATCH_SORT_ORDERS.map((option) => (
                        <Dropdown.Item
                            key={option.key}
                            id={option.key}
                            textValue={option.label}
                        >
                            <Dropdown.ItemIndicator type="dot" />
                            <Label>{option.label}</Label>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}
