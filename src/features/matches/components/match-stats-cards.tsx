"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Calendar } from "lucide-react";
import { Button, Card, Chip, Dropdown, Label, Skeleton } from "@heroui/react";
import type { UserMatch } from "@/features/matches/lib/queries";
import {
    getMatchStats,
    isInStatsPeriod,
    STATS_PERIODS,
    winPercentage,
    type StatsPeriod,
    type WinLoss,
} from "@/features/matches/utils/match-stats";

type ChipColor = "default" | "success" | "danger";

// A grid of small cards with the player's statistics over this month, this
// year (at first) or all time: matches, wins, losses, and sets, games and
// match tiebreaks won. `matches` are all their
// confirmed ones, newest first; the period is picked from them here.
export function MatchStatsCards({ matches }: { matches: UserMatch[] }) {
    const [period, setPeriod] = useState<StatsPeriod>("year");
    const stats = useMemo(() => {
        const now = new Date();
        return getMatchStats(
            matches.filter((match) =>
                isInStatsPeriod(match.playedAt, period, now),
            ),
        );
    }, [matches, period]);
    const winRate = winPercentage(stats.matches);

    return (
        <StatGrid action={<PeriodMenu period={period} onChange={setPeriod} />}>
            <StatCard
                label="Matches"
                value={stats.matches.won + stats.matches.lost}
            />
            <StatCard
                label="Wins"
                value={stats.matches.won}
                chip={
                    winRate !== null && {
                        text: `${winRate}%`,
                        color: "success",
                    }
                }
            />
            <StatCard
                label="Losses"
                value={stats.matches.lost}
                chip={
                    winRate !== null && {
                        text: `${100 - winRate}%`,
                        color: "danger",
                    }
                }
            />
            <WinLossCard label="Sets won" record={stats.sets} />
            <WinLossCard label="Games won" record={stats.games} />
            <WinLossCard
                label="Match tiebreaks"
                record={stats.matchTiebreaks}
            />
        </StatGrid>
    );
}

// Won and lost, e.g. "28:17", with the share won: green from half up,
// otherwise red. Without any played, no share.
function WinLossCard({ label, record }: { label: string; record: WinLoss }) {
    const percentage = winPercentage(record);
    return (
        <StatCard
            label={label}
            value={formatWinLoss(record)}
            chip={
                percentage !== null && {
                    text: `${percentage}%`,
                    color: percentage >= 50 ? "success" : "danger",
                }
            }
        />
    );
}

function StatCard({
    label,
    value,
    chip,
}: {
    label: string;
    value: ReactNode;
    // false or null for none
    chip?:
        | {
              text: string;
              color?: ChipColor;
          }
        | null
        | false;
}) {
    return (
        <Card className="gap-3">
            <p className="text-sm text-muted">{label}</p>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xl font-semibold tabular-nums sm:text-2xl">
                    {value}
                </p>
                {chip && (
                    <Chip
                        size="sm"
                        color={chip.color ?? "default"}
                        variant={chip.color ? "soft" : "secondary"}
                    >
                        {chip.text}
                    </Chip>
                )}
            </div>
        </Card>
    );
}

// The period the statistics cover: a button with a calendar and the
// period, which opens the menu
function PeriodMenu({
    period,
    onChange,
    isDisabled,
}: {
    period: StatsPeriod;
    onChange?: (period: StatsPeriod) => void;
    isDisabled?: boolean;
}) {
    const label = STATS_PERIODS.find((option) => option.key === period)?.label;
    return (
        <Dropdown>
            <Button variant="tertiary" size="sm" isDisabled={isDisabled}>
                <Calendar className="size-4" aria-hidden />
                {label}
            </Button>
            <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu
                    aria-label="Statistics period"
                    selectionMode="single"
                    disallowEmptySelection
                    selectedKeys={[period]}
                    onSelectionChange={(keys) => {
                        const [next] = keys as Set<StatsPeriod>;
                        if (next) {
                            onChange?.(next);
                        }
                    }}
                >
                    {STATS_PERIODS.map((option) => (
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

// Under a "Statistics" heading, with `action` on its right. Three in a
// row, or two on phones, where three would leave no room for the chips.
function StatGrid({
    action,
    children,
}: {
    action: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold">Statistics</h2>
                {action}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {children}
            </div>
        </section>
    );
}

// E.g. "28:17", like set scores
function formatWinLoss({ won, lost }: WinLoss) {
    return `${won}:${lost}`;
}

// Shown while the matches load, with the period button already in place
export function MatchStatsCardsFallback() {
    return (
        <StatGrid action={<PeriodMenu period="year" isDisabled />}>
            {Array.from({ length: 6 }, (_, index) => (
                <Card key={index} className="gap-3">
                    <Skeleton className="h-4 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                </Card>
            ))}
        </StatGrid>
    );
}
