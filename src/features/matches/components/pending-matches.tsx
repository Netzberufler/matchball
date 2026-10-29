"use client";

import { useState, useTransition } from "react";
import { Clock } from "lucide-react";
import { AlertDialog, Button, Card } from "@heroui/react";
import {
    acceptMatch,
    declineMatch,
    withdrawMatch,
} from "@/features/matches/actions/pending-match";
import type { PendingMatch } from "@/features/matches/lib/queries";
import { formatPlayedAt } from "@/features/matches/utils/match-score";
import { MatchScore, PlayerLink } from "./match-table";

// The viewer's pending matches, as cards rather than table rows so the
// buttons fit on phones. Matches the viewer logged wait for the opponent,
// and can be withdrawn; matches logged against the viewer can be accepted
// or declined. The actions reload the page's data, which moves an accepted
// match to the table below and drops a declined or withdrawn one.
export function PendingMatches({ matches }: { matches: PendingMatch[] }) {
    return (
        <ul className="flex flex-col gap-3">
            {matches.map((match) => (
                <li key={match.id}>
                    <PendingMatchCard match={match} />
                </li>
            ))}
        </ul>
    );
}

function PendingMatchCard({ match }: { match: PendingMatch }) {
    const [error, setError] = useState<string | null>(null);
    const [isAccepting, startAccept] = useTransition();
    const [isRemoving, startRemove] = useTransition();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const isBusy = isAccepting || isRemoving;
    const { name } = match.opponent;

    function onAccept() {
        setError(null);
        startAccept(async () => {
            setError((await acceptMatch(match.id)).error);
        });
    }

    // From the confirm dialog, which stays open until the match is gone
    function onRemove() {
        setError(null);
        startRemove(async () => {
            const remove = match.isLoggedByUser ? withdrawMatch : declineMatch;
            setError((await remove(match.id)).error);
            setIsConfirmOpen(false);
        });
    }

    return (
        <Card>
            <Card.Content className="flex flex-col gap-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                    <PlayerLink user={match.opponent} />
                    <span className="shrink-0 text-muted">
                        {formatPlayedAt(match.playedAt)}
                    </span>
                </div>
                <MatchScore match={match} isPending />
                <p className="flex items-start gap-2 text-muted">
                    <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
                    {match.isLoggedByUser
                        ? `Waiting for ${name} to confirm. The match is logged once they accept it.`
                        : `${name} logged this match against you. Accept it if the result is right.`}
                </p>
                <div className="flex flex-wrap gap-2">
                    {!match.isLoggedByUser && (
                        <Button
                            size="sm"
                            variant="primary"
                            isPending={isAccepting}
                            isDisabled={isBusy}
                            onPress={onAccept}
                        >
                            Accept
                        </Button>
                    )}
                    {/* Asks first, as the match is deleted */}
                    <AlertDialog
                        isOpen={isConfirmOpen}
                        onOpenChange={setIsConfirmOpen}
                    >
                        <Button
                            size="sm"
                            variant="danger-soft"
                            isDisabled={isBusy}
                        >
                            {match.isLoggedByUser ? "Withdraw" : "Decline"}
                        </Button>
                        <AlertDialog.Backdrop>
                            <AlertDialog.Container size="sm">
                                <AlertDialog.Dialog>
                                    <AlertDialog.Header>
                                        <AlertDialog.Icon status="danger" />
                                        <AlertDialog.Heading>
                                            {match.isLoggedByUser
                                                ? "Withdraw this match?"
                                                : "Decline this match?"}
                                        </AlertDialog.Heading>
                                    </AlertDialog.Header>
                                    <AlertDialog.Body>
                                        <p>
                                            {match.isLoggedByUser
                                                ? `The match against ${name} is deleted and they can no longer accept it. You can log it again with the right result.`
                                                : `The match is deleted and ${name} is told you declined it. This can't be undone.`}
                                        </p>
                                    </AlertDialog.Body>
                                    <AlertDialog.Footer>
                                        <Button
                                            variant="tertiary"
                                            isDisabled={isRemoving}
                                            onPress={() =>
                                                setIsConfirmOpen(false)
                                            }
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="danger"
                                            isPending={isRemoving}
                                            onPress={onRemove}
                                        >
                                            {match.isLoggedByUser
                                                ? "Withdraw match"
                                                : "Decline match"}
                                        </Button>
                                    </AlertDialog.Footer>
                                </AlertDialog.Dialog>
                            </AlertDialog.Container>
                        </AlertDialog.Backdrop>
                    </AlertDialog>
                </div>
                {error && (
                    <p role="alert" className="text-danger">
                        {error}
                    </p>
                )}
            </Card.Content>
        </Card>
    );
}
