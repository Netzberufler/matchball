import Link from "next/link";
import { Card, Chip, Skeleton } from "@heroui/react";
import { Trophy } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { MatchDetail as MatchDetailData } from "@/features/matches/lib/queries";
import { formatPlayedAt } from "@/features/matches/utils/match-score";
import { profilePath } from "@/features/profile/utils/profile-path";

// A confirmed match on its own page: the two players facing each other
// with a big "vs" between them, the winner marked, and the score below
export function MatchDetail({ match }: { match: MatchDetailData }) {
    return (
        <Card className="items-center gap-8 px-4 py-8 sm:px-8 sm:py-10">
            <p className="text-sm text-muted">
                <time dateTime={match.playedAt.toISOString().slice(0, 10)}>
                    {formatPlayedAt(match.playedAt)}
                </time>
            </p>
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-6">
                <Player user={match.left} isWinner={match.winner === "left"} />
                <Versus />
                <Player
                    user={match.right}
                    isWinner={match.winner === "right"}
                />
            </div>
            <Score match={match} />
        </Card>
    );
}

// In a gray square, level with the avatars' middle
function Versus() {
    return (
        <span aria-hidden className="flex h-24 items-center sm:h-35">
            {/* Lowercase italic letters sit low and lean right in their
                box, so 0.2em of padding below and on the right moves them
                to the square's middle. In em, so it holds at both sizes. */}
            <span className="flex size-11 items-center justify-center bg-default pb-[0.2em] pr-[0.2em] text-lg leading-none font-semibold italic tracking-tight sm:size-16.5 sm:text-3xl">
                vs
            </span>
        </span>
    );
}

// A large avatar with the name and username below, linking to the
// profile. The winner gets a green ring and badge, the loser a red badge.
function Player({
    user,
    isWinner,
}: {
    user: MatchDetailData["left"];
    isWinner: boolean;
}) {
    return (
        <div className="flex min-w-0 flex-col items-center gap-3 text-center">
            <Link
                href={profilePath(user.username)}
                className="group flex min-w-0 max-w-full flex-col items-center gap-3"
            >
                <span
                    className={`rounded-full ring-offset-4 ring-offset-surface ${
                        isWinner ? "ring-4 ring-success" : ""
                    }`}
                >
                    <UserAvatar name={user.name} image={user.image} size="xl" />
                </span>
                <span className="flex max-w-full flex-col">
                    <span className="break-words text-base font-semibold leading-tight group-hover:underline sm:text-xl">
                        {user.name}
                    </span>
                    {/* Spaces the link text for screen readers */}{" "}
                    <span className="truncate text-xs text-muted sm:text-sm">
                        @{user.username}
                    </span>
                </span>
            </Link>
            {isWinner ? (
                <Chip color="success" variant="soft">
                    <Trophy className="size-3.5" aria-hidden />
                    <Chip.Label>Winner</Chip.Label>
                </Chip>
            ) : (
                <Chip color="danger" variant="soft">
                    <Chip.Label>Loser</Chip.Label>
                </Chip>
            )}
        </div>
    );
}

// The sets side by side, from the left player's side, each over its label.
// The games of whoever won the set stand out.
function Score({ match }: { match: MatchDetailData }) {
    return (
        <dl className="mt-4 flex justify-center gap-6 sm:gap-12">
            {match.sets.map((set, index) => (
                <div
                    key={index}
                    className="flex flex-col-reverse items-center gap-1"
                >
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                        {set.isMatchTiebreak ? "Tiebreak" : `Set ${index + 1}`}
                    </dt>
                    <dd className="flex items-baseline gap-1 text-3xl font-semibold tabular-nums sm:gap-2 sm:text-5xl">
                        <span
                            className={
                                set.own > set.opponent ? "" : "text-muted"
                            }
                        >
                            {set.own}
                        </span>
                        <span className="text-muted">:</span>
                        <span
                            className={
                                set.opponent > set.own ? "" : "text-muted"
                            }
                        >
                            {set.opponent}
                        </span>
                    </dd>
                </div>
            ))}
        </dl>
    );
}

// Shown while the match loads, in the same shape
export function MatchDetailFallback() {
    return (
        <Card className="items-center gap-8 px-4 py-8 sm:px-8 sm:py-10">
            <Skeleton className="h-4 w-24 rounded-lg" />
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-6">
                {[0, 1].map((player) => (
                    <div
                        key={player}
                        className={`flex flex-col items-center gap-3 ${
                            player === 1 ? "col-start-3" : ""
                        }`}
                    >
                        <Skeleton className="size-24 rounded-full sm:size-35" />
                        <Skeleton className="h-6 w-28 rounded-lg" />
                        <Skeleton className="h-4 w-20 rounded-lg" />
                    </div>
                ))}
            </div>
            <Skeleton className="mt-4 h-12 w-48 rounded-lg" />
        </Card>
    );
}
