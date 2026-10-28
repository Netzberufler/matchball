"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { getLocalTimeZone, parseDate, today } from "@internationalized/date";
import {
    Button,
    buttonVariants,
    Calendar,
    Card,
    DateField,
    DatePicker,
    Description,
    FieldError,
    Form,
    Label,
    NumberField,
} from "@heroui/react";
import {
    createMatch,
    type MatchFormError,
} from "@/features/matches/actions/create-match";
import type { Opponent } from "@/features/matches/actions/search-opponents";
import {
    OPPONENT_FIELD,
    PLAYED_AT_FIELD,
    readEnteredSets,
    scoreField,
    SET_NUMBERS,
} from "@/features/matches/utils/match-form";
import {
    parseEnteredScore,
    SCORE_MAX,
} from "@/features/matches/utils/match-score";
import { OpponentComboBox } from "./opponent-combo-box";

type ScoreFormError = Extract<MatchFormError, { field: "score" }>;

// Adds a match the signed-in user played: the day, the opponent and the
// games of each set from the user's side. Saving goes to /matches.
export function AddMatchForm() {
    const [opponent, setOpponent] = useState<Opponent | null>(null);
    const [isPending, startTransition] = useTransition();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [scoreError, setScoreError] = useState<ScoreFormError | null>(null);

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        setFieldErrors({});
        // Checked here first, so a wrong score doesn't need a round trip
        const { error } = parseEnteredScore(readEnteredSets(formData));
        if (error) {
            setScoreError({ field: "score", ...error });
            return;
        }
        setScoreError(null);

        startTransition(async () => {
            // Redirects to /matches on success, so only errors come back
            const { error } = await createMatch(formData);
            if (error.field === "score") {
                setScoreError(error);
            } else {
                setFieldErrors({ [error.field]: error.message });
            }
        });
    }

    return (
        <Card>
            <Card.Content>
                <Form
                    className="flex flex-col gap-6"
                    validationErrors={fieldErrors}
                    onSubmit={onSubmit}
                >
                    <PlayedAtPicker />

                    <OpponentComboBox
                        name={OPPONENT_FIELD}
                        onChange={setOpponent}
                    />

                    <fieldset className="flex flex-col gap-2">
                        <legend className="mb-2 text-sm font-medium">
                            Result
                        </legend>
                        <div className="grid grid-cols-[4rem_1fr_1fr] items-center gap-x-3 gap-y-2 sm:max-w-sm">
                            <span />
                            <span className="text-sm text-muted">You</span>
                            <span className="truncate text-sm text-muted">
                                {opponent?.name ?? "Opponent"}
                            </span>
                            {SET_NUMBERS.map((set) => (
                                <SetRow
                                    key={set}
                                    set={set}
                                    opponentName={opponent?.name}
                                    isInvalid={scoreError?.set === set}
                                    // The marked fields block submitting
                                    // until the score changes
                                    onChange={() => setScoreError(null)}
                                />
                            ))}
                        </div>
                        {scoreError ? (
                            <p className="text-sm text-danger" role="alert">
                                {scoreError.message}
                            </p>
                        ) : (
                            <Description>
                                Games per set. Leave set 3 empty after two sets;
                                for a match tiebreak enter its points, e.g.
                                10:8.
                            </Description>
                        )}
                    </fieldset>

                    <div className="flex gap-3">
                        <Button type="submit" isPending={isPending}>
                            Save match
                        </Button>
                        {/* A link styled as a HeroUI button */}
                        <Link
                            href="/matches"
                            className={buttonVariants({ variant: "tertiary" })}
                        >
                            Cancel
                        </Link>
                    </div>
                </Form>
            </Card.Content>
        </Card>
    );
}

// Today never changes while the form is open
const subscribeToToday = () => () => {};

// Today in the user's time zone, e.g. "2026-10-28". Null on the server and
// while hydrating: the page is prerendered, so a date there would be stale.
function useToday() {
    const value = useSyncExternalStore(
        subscribeToToday,
        () => today(getLocalTimeZone()).toString(),
        () => null,
    );
    return value ? parseDate(value) : undefined;
}

// The day the match was played, today or earlier
function PlayedAtPicker() {
    const maxValue = useToday();
    return (
        <DatePicker
            isRequired
            name={PLAYED_AT_FIELD}
            // In the user's time zone; the server allows for the difference
            maxValue={maxValue}
            className="sm:max-w-xs"
        >
            <Label>Date</Label>
            <DateField.Group fullWidth variant="secondary">
                <DateField.Input>
                    {(segment) => <DateField.Segment segment={segment} />}
                </DateField.Input>
                <DateField.Suffix>
                    <DatePicker.Trigger>
                        <DatePicker.TriggerIndicator />
                    </DatePicker.Trigger>
                </DateField.Suffix>
            </DateField.Group>
            <FieldError />
            <DatePicker.Popover>
                <Calendar aria-label="Match date">
                    <Calendar.Header>
                        <Calendar.NavButton slot="previous" />
                        <Calendar.NavButton slot="next" />
                    </Calendar.Header>
                    <Calendar.Grid>
                        <Calendar.GridHeader>
                            {(day) => (
                                <Calendar.HeaderCell>{day}</Calendar.HeaderCell>
                            )}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                            {(date) => <Calendar.Cell date={date} />}
                        </Calendar.GridBody>
                    </Calendar.Grid>
                </Calendar>
            </DatePicker.Popover>
        </DatePicker>
    );
}

// A set's two score fields: the user's games and the opponent's
function SetRow({
    set,
    opponentName,
    isInvalid,
    onChange,
}: {
    set: 1 | 2 | 3;
    opponentName: string | undefined;
    isInvalid: boolean;
    onChange: () => void;
}) {
    return (
        <>
            <span className="text-sm font-medium">Set {set}</span>
            <ScoreField
                name={scoreField(set, "own")}
                label={`Set ${set}, your games`}
                isInvalid={isInvalid}
                onChange={onChange}
            />
            <ScoreField
                name={scoreField(set, "opponent")}
                label={`Set ${set}, ${opponentName ?? "opponent"}'s games`}
                isInvalid={isInvalid}
                onChange={onChange}
            />
        </>
    );
}

// A whole number from 0 to SCORE_MAX; other characters can't be typed.
// Not required: parseEnteredScore explains what's missing, set by set.
// onChange runs when a typed number is committed, e.g. on leaving the field.
function ScoreField({
    name,
    label,
    isInvalid,
    onChange,
}: {
    name: string;
    label: string;
    isInvalid: boolean;
    onChange: () => void;
}) {
    return (
        <NumberField
            variant="secondary"
            aria-label={label}
            name={name}
            isInvalid={isInvalid}
            onChange={onChange}
            minValue={0}
            maxValue={SCORE_MAX}
            formatOptions={{ maximumFractionDigits: 0, useGrouping: false }}
        >
            <NumberField.Group>
                <NumberField.Input className="w-full text-center tabular-nums" />
            </NumberField.Group>
        </NumberField>
    );
}
