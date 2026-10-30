"use client";

import { useState } from "react";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { CalendarRange } from "lucide-react";
import { Button, Popover, RangeCalendar } from "@heroui/react";
import type { MatchDateRange } from "@/features/matches/utils/match-filters";

// A button that opens a calendar to pick the first and last day of the
// matches to show. It closes once both are picked, and then shows the
// range, e.g. "Oct 1 – 27". Clear removes the range.
export function MatchDateRangeMenu({
    range,
    onChange,
}: {
    range: MatchDateRange | null;
    onChange: (range: MatchDateRange | null) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button variant="tertiary" size="sm">
                <CalendarRange className="size-4" aria-hidden />
                {range ? formatDateRange(range) : "Date"}
            </Button>
            <Popover.Content placement="bottom start">
                <Popover.Dialog
                    aria-label="Filter by date"
                    className="flex flex-col gap-2"
                >
                    <RangeCalendar
                        aria-label="Days played"
                        value={
                            range && {
                                start: parseDate(range.start),
                                end: parseDate(range.end),
                            }
                        }
                        onChange={(value) => {
                            onChange({
                                start: value.start.toString(),
                                end: value.end.toString(),
                            });
                            setIsOpen(false);
                        }}
                        // Matches can't be played in the future
                        maxValue={today(getLocalTimeZone())}
                    >
                        <RangeCalendar.Header>
                            <RangeCalendar.Heading className="mr-auto" />
                            <RangeCalendar.NavButton slot="previous" />
                            <RangeCalendar.NavButton slot="next" />
                        </RangeCalendar.Header>
                        <RangeCalendar.Grid>
                            <RangeCalendar.GridHeader>
                                {(day) => (
                                    <RangeCalendar.HeaderCell>
                                        {day}
                                    </RangeCalendar.HeaderCell>
                                )}
                            </RangeCalendar.GridHeader>
                            <RangeCalendar.GridBody>
                                {(date) => <RangeCalendar.Cell date={date} />}
                            </RangeCalendar.GridBody>
                        </RangeCalendar.Grid>
                    </RangeCalendar>
                    {range && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="self-end"
                            onPress={() => {
                                onChange(null);
                                setIsOpen(false);
                            }}
                        >
                            Clear dates
                        </Button>
                    )}
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}

const dayFormat = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    // The days are dates without a time, parsed as midnight UTC
    timeZone: "UTC",
});
const dayWithYearFormat = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
});

// E.g. "Oct 1 – 27", "Sep 28 – Oct 3", or with the years when the range
// isn't all in the current one: "Dec 28, 2025 – Jan 3, 2026"
function formatDateRange({ start, end }: MatchDateRange) {
    const currentYear = String(new Date().getFullYear());
    const format =
        start.startsWith(currentYear) && end.startsWith(currentYear)
            ? dayFormat
            : dayWithYearFormat;
    return format.formatRange(new Date(start), new Date(end));
}
