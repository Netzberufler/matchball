"use client";

import { useEffect, useState, useTransition } from "react";
import { Sword } from "lucide-react";
import {
    type CalendarDateTime,
    getLocalTimeZone,
    now,
    toCalendarDateTime,
} from "@internationalized/date";
import {
    Button,
    Calendar,
    DateField,
    DatePicker,
    FieldError,
    Label,
    Modal,
} from "@heroui/react";
import { UserIdentity } from "@/components/ui/user-identity";
import {
    checkChallenge,
    createChallenge,
} from "@/features/challenges/actions/create-challenge";
import { loadChallengeSuggestions } from "@/features/challenges/actions/load-challenges";
import {
    DEADLINE_TOO_LATE_MESSAGE,
    DEADLINE_TOO_SOON_MESSAGE,
    DEFAULT_DEADLINE_DAYS,
    MAX_DEADLINE_DAYS,
    MIN_DEADLINE_DAYS,
} from "@/features/challenges/utils/challenge-rules";
import { searchOpponents } from "@/features/matches/actions/search-opponents";
import type { PublicUser } from "@/features/profile/utils/public-user";
import {
    USER_CHOICE_CLASS,
    UserPicker,
} from "@/features/search/components/user-picker";

// The Challenge button on /challenges and on profiles. It opens a popup to
// pick whom to challenge, like New chat on /messages, then the deadline for
// their answer. With `user` (on their profile), it opens with them chosen,
// though Change still picks someone else. Sending it closes the popup; the
// action reloads the page's data, which adds the challenge to the table.
export function NewChallengeButton({
    user,
    fullWidth = false,
    size = "md",
}: {
    user?: PublicUser;
    fullWidth?: boolean;
    // "sm" next to the filter buttons above the challenges table
    size?: "sm" | "md";
}) {
    const [isOpen, setIsOpen] = useState(false);
    // Whom the user picked in the popup (`user: null` after Change); null
    // until then, which leaves `user`
    const [picked, setPicked] = useState<{ user: PublicUser | null } | null>(
        null,
    );
    const challenged = picked ? picked.user : (user ?? null);

    function onOpenChange(open: boolean) {
        setIsOpen(open);
        // Starts over each time it opens
        if (!open) {
            setPicked(null);
        }
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Button variant="primary" size={size} fullWidth={fullWidth}>
                <Sword className="size-4" aria-hidden />
                Challenge
            </Button>
            <Modal.Backdrop>
                <Modal.Container size="md">
                    <Modal.Dialog>
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <Modal.Heading>New challenge</Modal.Heading>
                        </Modal.Header>
                        {isOpen &&
                            (challenged ? (
                                <ChallengeForm
                                    // Starts over for each user
                                    key={challenged.id}
                                    challenged={challenged}
                                    onChange={() => setPicked({ user: null })}
                                    onSent={() => onOpenChange(false)}
                                />
                            ) : (
                                <Modal.Body>
                                    <UserPicker
                                        search={searchOpponents}
                                        loadSuggestions={
                                            loadChallengeSuggestions
                                        }
                                        suggestionsEmptyMessage="Search for someone to challenge."
                                        renderChoice={(choice, identity) => (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPicked({ user: choice })
                                                }
                                                className={USER_CHOICE_CLASS}
                                            >
                                                {identity}
                                            </button>
                                        )}
                                    />
                                </Modal.Body>
                            ))}
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}

// The chosen user, with a button to choose someone else, and the deadline:
// a day and a time (24h) in the user's time zone, from two days on. It
// starts a week from now, at the next full hour. Whether the user can be
// challenged is checked right away: if not, e.g. as they already have a
// challenge going, it says why instead of asking for the deadline.
function ChallengeForm({
    challenged,
    onChange,
    onSent,
}: {
    challenged: PublicUser;
    onChange: () => void;
    onSent: () => void;
}) {
    // Only rendered in the browser, once the popup is open, so the time
    // here is the user's
    const [limits] = useState(() => {
        const current = toCalendarDateTime(now(getLocalTimeZone())).set({
            second: 0,
            millisecond: 0,
        });
        return {
            min: current.add({ days: MIN_DEADLINE_DAYS }),
            max: current.add({ days: MAX_DEADLINE_DAYS }),
            initial: current
                .add({ days: DEFAULT_DEADLINE_DAYS, hours: 1 })
                .set({ minute: 0 }),
        };
    });
    const [deadline, setDeadline] = useState<CalendarDateTime | null>(
        limits.initial,
    );
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    // null while checking, then why they can't be challenged, or null in
    // `error` if they can
    const [check, setCheck] = useState<{ error: string | null } | null>(null);

    useEffect(() => {
        checkChallenge(challenged.id).then(setCheck, () =>
            // Sending checks again and says what's wrong
            setCheck({ error: null }),
        );
    }, [challenged.id]);
    const blockedReason = check?.error ?? null;

    const isInvalid =
        !deadline ||
        deadline.compare(limits.min) < 0 ||
        deadline.compare(limits.max) > 0;

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // The field already says what's wrong, or the check does
        if (isInvalid || !check || blockedReason) {
            return;
        }
        setError(null);
        startTransition(async () => {
            const result = await createChallenge(
                challenged.id,
                deadline.toDate(getLocalTimeZone()),
            );
            if (result.error) {
                setError(result.error);
            } else {
                onSent();
            }
        });
    }

    return (
        <form onSubmit={onSubmit} className="contents">
            {/* Some room between the heading and the chosen user */}
            <Modal.Body className="mt-4 flex flex-col gap-6">
                {/* The name in the text color, as wherever users are
                    shown, rather than the popup's muted one */}
                <div className="flex items-center gap-3 text-foreground">
                    <UserIdentity user={challenged} className="flex-1" />
                    <Button
                        size="sm"
                        variant="outline"
                        isDisabled={isPending}
                        onPress={onChange}
                    >
                        Change
                    </Button>
                </div>
                {blockedReason ? (
                    <p className="text-sm text-danger" role="alert">
                        {blockedReason}
                    </p>
                ) : (
                    <DatePicker
                        isRequired
                        value={deadline}
                        onChange={(value) => {
                            setError(null);
                            setDeadline(value);
                        }}
                        granularity="minute"
                        hourCycle={24}
                        minValue={limits.min}
                        maxValue={limits.max}
                        isInvalid={isInvalid}
                        validationBehavior="aria"
                    >
                        <Label>Deadline</Label>
                        <DateField.Group fullWidth variant="secondary">
                            <DateField.Input>
                                {(segment) => (
                                    <DateField.Segment segment={segment} />
                                )}
                            </DateField.Input>
                            <DateField.Suffix>
                                <DatePicker.Trigger>
                                    <DatePicker.TriggerIndicator />
                                </DatePicker.Trigger>
                            </DateField.Suffix>
                        </DateField.Group>
                        <FieldError>
                            {!deadline
                                ? "Choose a deadline"
                                : deadline.compare(limits.max) > 0
                                  ? DEADLINE_TOO_LATE_MESSAGE
                                  : DEADLINE_TOO_SOON_MESSAGE}
                        </FieldError>
                        <DatePicker.Popover>
                            {/* HeroUI's Calendar sets its own limits unless
                            given these, so earlier days could be chosen */}
                            <Calendar
                                aria-label="Deadline"
                                minValue={limits.min}
                                maxValue={limits.max}
                            >
                                <Calendar.Header>
                                    <Calendar.NavButton slot="previous" />
                                    <Calendar.NavButton slot="next" />
                                </Calendar.Header>
                                <Calendar.Grid>
                                    <Calendar.GridHeader>
                                        {(day) => (
                                            <Calendar.HeaderCell>
                                                {day}
                                            </Calendar.HeaderCell>
                                        )}
                                    </Calendar.GridHeader>
                                    <Calendar.GridBody>
                                        {(date) => (
                                            <Calendar.Cell date={date} />
                                        )}
                                    </Calendar.GridBody>
                                </Calendar.Grid>
                            </Calendar>
                        </DatePicker.Popover>
                    </DatePicker>
                )}
                {error && (
                    <p className="text-sm text-danger" role="alert">
                        {error}
                    </p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="tertiary" slot="close" isDisabled={isPending}>
                    Cancel
                </Button>
                {/* Only once it's known they can be challenged */}
                {!blockedReason && (
                    <Button
                        type="submit"
                        variant="primary"
                        isPending={isPending}
                        isDisabled={!check}
                    >
                        <Sword className="size-4" aria-hidden />
                        Challenge
                    </Button>
                )}
            </Modal.Footer>
        </form>
    );
}
