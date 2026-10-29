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
import { createMatch } from "@/features/matches/actions/create-match";
import type { Opponent } from "@/features/matches/actions/search-opponents";
import { updateMatch } from "@/features/matches/actions/update-match";
import type { EditableMatch } from "@/features/matches/lib/queries";
import {
    type MatchFormError,
    OPPONENT_FIELD,
    PLAYED_AT_FIELD,
    parseEditMatchForm,
    parseMatchForm,
    scoreField,
    SET_NUMBERS,
    toMatchFormError,
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
// and the games of each set from the user's side. With `match`, edits that
// pending match instead: it starts out filled in, and the opponent can't be
// changed. Saving goes to /matches.
export function MatchForm({
    viewer,
    match,
}: {
    viewer: Viewer;
    match?: EditableMatch;
}) {
    const [pickedOpponent, setOpponent] = useState<Opponent | null>(null);
    const opponent = match?.opponent ?? pickedOpponent;
    const [isPending, startTransition] = useTransition();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [scoreError, setScoreError] = useState<ScoreFormError | null>(null);
    // A problem with the whole form, e.g. that nothing was changed
    const [formError, setFormError] = useState<string | null>(null);
    // What's in each score field. Updated with every keystroke, so the
    // third set opens as soon as the first two are split, before Tab moves
    // on from the last field of set 2; and by the set result buttons.
    const [scores, setScores] = useState<Scores>(match?.scores ?? {});
    const needsThirdSet = areFirstSetsSplit(firstSets(scores));
    const winner = enteredWinner(scores);

    function updateScores(changes: Scores) {
        setScoreError(null);
        setFormError(null);
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
        setScoreError(null);
        setFormError(null);
        // Checked here first with the schema the action uses, so mistakes
        // don't need a round trip
        const parsed = match
            ? parseEditMatchForm(formData)
            : parseMatchForm(formData);
        if (!parsed.success) {
            showError(toMatchFormError(parsed.error));
            return;
        }

        startTransition(async () => {
            // Redirects to /matches on success, so only errors come back
            const { error } = match
                ? await updateMatch(match.id, match.version, formData)
                : await createMatch(formData);
            showError(error);
        });
    }

    function showError(error: MatchFormError) {
        if (error.field === "score") {
            setScoreError(error);
        } else if (error.field === "form") {
            setFormError(error.message);
        } else {
            setFieldErrors({ [error.field]: error.message });
        }
    }

    return (
        <Card>
            <Card.Content>
                <Form
                    className="flex flex-col gap-6"
                    validationErrors={fieldErrors}
                    onSubmit={onSubmit}
                >
                    <PlayedAtPicker
                        defaultValue={match?.playedAt}
                        onChange={() => setFormError(null)}
                    />

                    {/* Fixed when editing: the versus line below shows it */}
                    {!match && (
                        <OpponentComboBox
                            name={OPPONENT_FIELD}
                            onChange={setOpponent}
                        />
                    )}

                    {opponent && (
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
                    )}

                    <fieldset className="flex min-w-0 flex-col gap-2">
                        {/* HeroUI's label style, with the same required star
                            as Date and Opponent */}
                        <legend className="label label--required mb-2">
                            Result
                        </legend>
                        {/* All sets in one line, written like a score:
                            6 : 4 / 3 : 6 / 10 : 8 */}
                        <div className="flex items-center gap-1 sm:gap-1.5">
                            {SET_NUMBERS.map((set) => (
                                <SetScore
                                    key={set}
                                    set={set}
                                    scores={scores}
                                    opponentName={opponent?.name}
                                    // Only played when the first two sets
                                    // were split. Disabled fields aren't
                                    // submitted.
                                    isDisabled={set === 3 && !needsThirdSet}
                                    // The marked fields block submitting
                                    // until the score changes, which clears
                                    // the error
                                    isInvalid={scoreError?.set === set}
                                    onChange={updateScores}
                                />
                            ))}
                        </div>
                        <SetResultButtons
                            scores={scores}
                            onChange={updateScores}
                        />
                        {scoreError && (
                            <p className="text-sm text-danger" role="alert">
                                {scoreError.message}
                            </p>
                        )}
                        {/* Once the score is a finished match, styled like
                            the versus line */}
                        {winner && opponent && (
                            <p className="mt-2 flex min-w-0 items-center gap-2 text-sm">
                                <span className="shrink-0 text-muted">
                                    And the winner is
                                </span>
                                <MatchPlayer
                                    user={
                                        winner === "player1" ? viewer : opponent
                                    }
                                />
                            </p>
                        )}
                    </fieldset>

                    {formError && (
                        <p className="text-sm text-danger" role="alert">
                            {formError}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <Button type="submit" isPending={isPending}>
                            {match ? "Save changes" : "Save match"}
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

// The day the match was played, today or earlier, starting out as
// `defaultValue` (e.g. "2026-10-28") if given
function PlayedAtPicker({
    defaultValue,
    onChange,
}: {
    defaultValue?: string;
    onChange: () => void;
}) {
    const maxValue = useToday();
    return (
        <DatePicker
            isRequired
            name={PLAYED_AT_FIELD}
            defaultValue={defaultValue ? parseDate(defaultValue) : undefined}
            onChange={onChange}
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
// between them and a slash before them from the second set on
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
    const field = (side: "own" | "opponent", label: string) => {
        const name = scoreField(set, side);
        return (
            <ScoreField
                name={name}
                label={label}
                value={scores[name] ?? null}
                maxValue={scoreMax(set)}
                isDisabled={isDisabled}
                isInvalid={isInvalid}
                onChange={(changed) => onChange({ [name]: changed })}
            />
        );
    };

    return (
        <>
            {set > 1 && <ScoreSeparator>/</ScoreSeparator>}
            <div className="flex min-w-0 flex-[2] items-center gap-1 sm:flex-none sm:gap-1.5">
                {field("own", `Set ${set}, your games`)}
                <ScoreSeparator>:</ScoreSeparator>
                {field(
                    "opponent",
                    `Set ${set}, ${opponentName ?? "opponent"}'s games`,
                )}
            </div>
        </>
    );
}

// A button for every possible set result: wins in the first row, losses in
// the second. A press fills set 1 while both its fields are empty, and set 2
// after that, also when set 1 was typed in.
function SetResultButtons({
    scores,
    onChange,
}: {
    scores: Scores;
    onChange: (changes: Scores) => void;
}) {
    const set1 = enteredSets(scores)[0];
    const set = set1.own === null && set1.opponent === null ? 1 : 2;
    const rows = [
        WON_SET_SCORES,
        WON_SET_SCORES.map(([winner, loser]) => [loser, winner] as const),
    ];
    return (
        // About as wide as the score fields on larger screens
        <div className="flex flex-col gap-0.5 sm:max-w-sm">
            {rows.map((row, index) => (
                <div key={index} className="grid grid-cols-7 gap-0.5">
                    {row.map(([own, opponent]) => (
                        <Button
                            key={`${own}:${opponent}`}
                            size="sm"
                            variant="outline"
                            aria-label={`Set ${set}: ${own} to ${opponent}`}
                            className="h-7 w-full min-w-0 px-0 tabular-nums"
                            onPress={() =>
                                onChange({
                                    [scoreField(set, "own")]: own,
                                    [scoreField(set, "opponent")]: opponent,
                                })
                            }
                        >
                            {own}:{opponent}
                        </Button>
                    ))}
                </div>
            ))}
        </div>
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
