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
    FieldError,
    Form,
    Label,
    NumberField,
} from "@heroui/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { Viewer } from "@/features/auth/components/viewer-provider";
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
    areFirstSetsSplit,
    getScoreWinner,
    parseEnteredScore,
    scoreMax,
    WON_SET_SCORES,
} from "@/features/matches/utils/match-score";
import { OpponentComboBox } from "./opponent-combo-box";

type ScoreFormError = Extract<MatchFormError, { field: "score" }>;

// The score fields' numbers by field name, null or missing where empty
type Scores = Record<string, number | null>;

// The three sets as entered
function enteredSets(scores: Scores) {
    const [set1, set2, set3] = SET_NUMBERS.map((set) => ({
        own: scores[scoreField(set, "own")] ?? null,
        opponent: scores[scoreField(set, "opponent")] ?? null,
    }));
    return [set1!, set2!, set3!] as const;
}

// The first two sets as entered
function firstSets(scores: Scores) {
    return enteredSets(scores).slice(0, 2);
}

// Who won by the entered score: "player1" is the user. Null until it's a
// finished, valid match.
function enteredWinner(scores: Scores) {
    const { score } = parseEnteredScore([...enteredSets(scores)]);
    return score ? getScoreWinner(score) : null;
}

// Adds a match the signed-in user (`viewer`) played: the day, the opponent
// and the games of each set from the user's side. Saving goes to /matches.
export function AddMatchForm({ viewer }: { viewer: Viewer }) {
    const [opponent, setOpponent] = useState<Opponent | null>(null);
    const [isPending, startTransition] = useTransition();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [scoreError, setScoreError] = useState<ScoreFormError | null>(null);
    // What's in each score field. Updated with every keystroke, so the
    // third set opens as soon as the first two are split, before Tab moves
    // on from the last field of set 2; and by the set result buttons.
    const [scores, setScores] = useState<Scores>({});
    const needsThirdSet = areFirstSetsSplit(firstSets(scores));
    const winner = enteredWinner(scores);

    function updateScores(changes: Scores) {
        setScoreError(null);
        setScores((current) => {
            const next = { ...current, ...changes };
            // The third set starts over empty whenever it's not needed
            if (!areFirstSetsSplit(firstSets(next))) {
                next[scoreField(3, "own")] = null;
                next[scoreField(3, "opponent")] = null;
            }
            return next;
        });
    }

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

                    {/* The match and its result once the opponent is
                        chosen. The scores are kept if they change it. */}
                    {opponent && (
                        <>
                            <section className="flex flex-col gap-2">
                                {/* Styled like the fields' labels */}
                                <h2 className="text-sm font-medium">Match</h2>
                                <p className="flex min-w-0 items-center gap-2 text-sm">
                                    <MatchPlayer user={viewer} />
                                    <span className="shrink-0 text-muted">
                                        versus
                                    </span>
                                    <MatchPlayer user={opponent} />
                                </p>
                            </section>

                            <fieldset className="flex min-w-0 flex-col gap-2">
                                {/* HeroUI's label style, with the same
                                    required star as Date and Opponent */}
                                <legend className="label label--required mb-2">
                                    Result
                                </legend>
                                {/* All sets in one line, written like a
                                    score: 6 : 4 / 3 : 6 / 10 : 8, with
                                    buttons for the possible results below
                                    the first two */}
                                <div className="flex items-start gap-1 sm:gap-1.5">
                                    {SET_NUMBERS.map((set) => (
                                        <SetScore
                                            key={set}
                                            set={set}
                                            scores={scores}
                                            opponentName={opponent.name}
                                            // Only played when the first two
                                            // sets were split. Disabled
                                            // fields aren't submitted.
                                            isDisabled={
                                                set === 3 && !needsThirdSet
                                            }
                                            // The marked fields block
                                            // submitting until the score
                                            // changes, which clears the error
                                            isInvalid={scoreError?.set === set}
                                            onChange={updateScores}
                                        />
                                    ))}
                                </div>
                                {scoreError && (
                                    <p
                                        className="text-sm text-danger"
                                        role="alert"
                                    >
                                        {scoreError.message}
                                    </p>
                                )}
                                {/* Once the score is a finished match,
                                    styled like the versus line */}
                                {winner && (
                                    <p className="mt-2 flex min-w-0 items-center gap-2 text-sm">
                                        <span className="shrink-0 text-muted">
                                            And the winner is
                                        </span>
                                        <MatchPlayer
                                            user={
                                                winner === "player1"
                                                    ? viewer
                                                    : opponent
                                            }
                                        />
                                    </p>
                                )}
                            </fieldset>
                        </>
                    )}

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

// A player in the "you versus opponent" line: a small avatar and the full name
function MatchPlayer({ user }: { user: Viewer }) {
    return (
        <span className="flex min-w-0 items-center gap-2">
            <UserAvatar name={user.name} image={user.image} size="sm" />
            <span className="truncate font-semibold">{user.name}</span>
        </span>
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

// One set's score: the user's games and the opponent's, with a colon
// between them and a slash before them from the second set on. Below the
// first two sets, a button for each possible result in two columns as wide
// as the fields together: wins on the left, losses on the right.
function SetScore({
    set,
    scores,
    opponentName,
    isDisabled,
    isInvalid,
    onChange,
}: {
    set: 1 | 2 | 3;
    scores: Scores;
    opponentName: string | undefined;
    isDisabled: boolean;
    isInvalid: boolean;
    onChange: (changes: Scores) => void;
}) {
    const ownName = scoreField(set, "own");
    const opponentFieldName = scoreField(set, "opponent");
    const own = scores[ownName] ?? null;
    const opponentGames = scores[opponentFieldName] ?? null;
    const field = (name: string, label: string, value: number | null) => (
        <ScoreField
            name={name}
            label={label}
            value={value}
            maxValue={scoreMax(set)}
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            onChange={(changed) => onChange({ [name]: changed })}
        />
    );
    const resultButton = ([setOwn, setOpponent]: readonly [number, number]) => (
        <SetResultButton
            key={`${setOwn}:${setOpponent}`}
            set={set}
            own={setOwn}
            opponent={setOpponent}
            isSelected={own === setOwn && opponentGames === setOpponent}
            onPress={() =>
                onChange({
                    [ownName]: setOwn,
                    [opponentFieldName]: setOpponent,
                })
            }
        />
    );

    return (
        <>
            {set > 1 && (
                // Lined up with the fields, above the buttons
                <span className={`flex ${SCORE_FIELD_HEIGHT} items-center`}>
                    <ScoreSeparator>/</ScoreSeparator>
                </span>
            )}
            <div className="flex min-w-0 flex-[2] flex-col gap-2 sm:flex-none">
                <div className="flex items-center gap-1 sm:gap-1.5">
                    {field(ownName, `Set ${set}, your games`, own)}
                    <ScoreSeparator>:</ScoreSeparator>
                    {field(
                        opponentFieldName,
                        `Set ${set}, ${opponentName ?? "opponent"}'s games`,
                        opponentGames,
                    )}
                </div>
                {set < 3 && (
                    // Two equal columns across the set's width, 2px apart
                    <div className="grid grid-cols-2 gap-0.5">
                        <div className="flex min-w-0 flex-col gap-0.5">
                            {WON_SET_SCORES.map(resultButton)}
                        </div>
                        <div className="flex min-w-0 flex-col gap-0.5">
                            {WON_SET_SCORES.map(([winner, loser]) =>
                                resultButton([loser, winner]),
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

// Fills both fields of a set with one result, e.g. 6:4
function SetResultButton({
    set,
    own,
    opponent,
    isSelected,
    onPress,
}: {
    set: 1 | 2 | 3;
    own: number;
    opponent: number;
    isSelected: boolean;
    onPress: () => void;
}) {
    return (
        <Button
            size="sm"
            variant={isSelected ? "primary" : "outline"}
            aria-label={`Set ${set}: ${own} to ${opponent}`}
            aria-pressed={isSelected}
            className="h-7 w-full min-w-0 px-0 tabular-nums"
            onPress={onPress}
        >
            {own}:{opponent}
        </Button>
    );
}

// The ":" within a set or "/" between sets. The fields' labels already say
// which set each is, so screen readers skip it.
function ScoreSeparator({ children }: { children: string }) {
    return (
        <span aria-hidden className="text-lg font-semibold text-muted">
            {children}
        </span>
    );
}

// The width of a score field: room for two digits; on phones the fields
// share the line evenly
const SCORE_COLUMN = "min-w-0 flex-1 sm:w-12 sm:flex-none";
// The height of a score field, to line the "/" up with them
const SCORE_FIELD_HEIGHT = "h-9";

// A whole number from 0 to maxValue: 0 to 7 games in the first two sets,
// up to 99 in the third. Other characters, and numbers above maxValue,
// can't be typed. createMatch checks the same limits again.
// Not required: parseEnteredScore explains what's missing, set by set.
// onChange gets the number (null if empty) with every keystroke, and again
// when it's committed, e.g. on leaving the field. Single-digit fields move
// on to the next field once their digit is typed, and Backspace walks back
// through the fields (see onKeyDown).
function ScoreField({
    name,
    label,
    value,
    maxValue,
    isDisabled,
    isInvalid,
    onChange,
}: {
    name: string;
    label: string;
    value: number | null;
    maxValue: number;
    isDisabled: boolean;
    isInvalid: boolean;
    onChange: (value: number | null) => void;
}) {
    const isSingleDigit = maxValue < 10;
    return (
        <NumberField
            variant="secondary"
            aria-label={label}
            name={name}
            // NaN is the field's empty value
            value={value ?? NaN}
            onChange={(changed) =>
                onChange(Number.isNaN(changed) ? null : changed)
            }
            isDisabled={isDisabled}
            isInvalid={isInvalid}
            className={SCORE_COLUMN}
            minValue={0}
            maxValue={maxValue}
            formatOptions={{ maximumFractionDigits: 0, useGrouping: false }}
        >
            <NumberField.Group>
                <NumberField.Input
                    className="w-full px-1 text-center tabular-nums"
                    // A single digit when the most is 7
                    maxLength={String(maxValue).length}
                    data-score-field
                    // Typing replaces what's there, also with maxLength 1
                    onFocus={(event) => event.currentTarget.select()}
                    onKeyDown={(event) => {
                        if (event.key !== "Backspace") {
                            return;
                        }
                        const input = event.currentTarget;
                        if (input.value === "") {
                            // Nothing left here: go back to the field before
                            event.preventDefault();
                            focusScoreField(input, -1);
                        } else if (isSingleDigit) {
                            // Delete the digit, then go back, so each
                            // Backspace clears one field
                            setTimeout(() => focusScoreField(input, -1));
                        }
                    }}
                    onBeforeInput={(event) => {
                        // What the field would hold after this keystroke or
                        // paste, refused if it's not a number up to maxValue
                        const input = event.currentTarget;
                        const data = (event.nativeEvent as InputEvent).data;
                        if (data === null) {
                            return;
                        }
                        const next =
                            input.value.slice(0, input.selectionStart ?? 0) +
                            data +
                            input.value.slice(
                                input.selectionEnd ?? input.value.length,
                            );
                        if (!/^\d*$/.test(next) || Number(next) > maxValue) {
                            event.preventDefault();
                        }
                    }}
                    onInput={(event) => {
                        const input = event.currentTarget;
                        // The field drops anything but digits right after
                        const digits = /^\d+/.exec(input.value);
                        onChange(digits ? Number(digits[0]) : null);
                        if (isSingleDigit && digits) {
                            // After the re-render, which may have just
                            // enabled the third set
                            setTimeout(() => focusScoreField(input, 1));
                        }
                    }}
                />
            </NumberField.Group>
        </NumberField>
    );
}

// Moves the focus `step` score fields on (1) or back (-1), skipping disabled
// ones, and selects the number there so typing replaces it. Stays put at
// either end.
function focusScoreField(from: HTMLInputElement, step: 1 | -1) {
    const fields = Array.from(
        from.form?.querySelectorAll<HTMLInputElement>(
            "input[data-score-field]:not(:disabled)",
        ) ?? [],
    );
    const target = fields[fields.indexOf(from) + step];
    target?.focus();
    target?.select();
}
