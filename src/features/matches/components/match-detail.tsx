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
        <Card className="items-center gap-8 px-4 pb-4 pt-8 sm:px-6 sm:pb-6 sm:pt-10">
            <p className="text-base text-muted">
                <time dateTime={match.playedAt.toISOString().slice(0, 10)}>
                    {formatPlayedAt(match.playedAt)}
                </time>
            </p>
            {/* Two rows: avatar and name, then the badges. Each player
                spans both through a subgrid, so the "vs" can center on the
                first row only, whatever height the names wrap to. */}
            <div className="grid w-full grid-cols-[1fr_auto_1fr] grid-rows-[auto_auto] gap-x-2 gap-y-3 sm:gap-x-6">
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

// On a gray parallelogram leaning like the italic letters, level with the
// middle of the players' avatar and name
function Versus() {
    return (
        // The box is skewed and the text skewed back, so only the
        // background slants. Lowercase italic letters sit low and lean
        // right, so 0.2em of padding below and on the right moves them to
        // the middle. In em, so it holds at both sizes.
        <span
            aria-hidden
            className="col-start-2 row-start-1 flex h-9 w-12 -skew-x-12 items-center justify-center self-center bg-surface-secondary/60 pb-[0.2em] pr-[0.2em] text-base leading-none font-semibold italic tracking-tight sm:h-14 sm:w-18 sm:text-2xl"
        >
            <span className="skew-x-12">vs</span>
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
        <div className="row-span-2 grid min-w-0 grid-rows-subgrid justify-items-center text-center">
            <Link
                href={profilePath(user.username)}
                className="group flex min-w-0 max-w-full flex-col items-center gap-3"
            >
                <span
                    className={`rounded-full ring-offset-4 ring-offset-surface ${
                        isWinner ? "ring-4 ring-success" : ""
                    }`}
                >
                    <UserAvatar name={user.name} image={user.image} size="lg" />
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
                <Chip color="success" variant="soft" className="self-start">
                    <Trophy className="size-3.5" aria-hidden />
                    <Chip.Label>Winner</Chip.Label>
                </Chip>
            ) : (
                <Chip color="danger" variant="soft" className="self-start">
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
        <dl className="mt-4 flex w-full justify-center gap-6 rounded-2xl bg-surface-secondary/60 px-4 py-5 sm:gap-12 sm:py-6">
            {match.sets.map((set, index) => (
                <div
                    key={index}
                    className="flex flex-col-reverse items-center gap-1"
                >
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted">
                        {set.isMatchTiebreak ? "Tiebreak" : `Set ${index + 1}`}
                    </dt>
                    <dd className="flex items-baseline gap-1 text-2xl font-semibold tabular-nums sm:gap-2 sm:text-4xl">
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
        <Card className="items-center gap-8 px-4 pb-4 pt-8 sm:px-6 sm:pb-6 sm:pt-10">
            <Skeleton className="h-5 w-28 rounded-lg" />
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-6">
                {[0, 1].map((player) => (
                    <div
                        key={player}
                        className={`flex flex-col items-center gap-3 ${
                            player === 1 ? "col-start-3" : ""
                        }`}
                    >
                        <Skeleton className="size-20 rounded-full sm:size-30" />
                        <Skeleton className="h-6 w-28 rounded-lg" />
                        <Skeleton className="h-4 w-20 rounded-lg" />
                    </div>
                ))}
            </div>
            <Skeleton className="mt-4 h-24 w-full rounded-2xl sm:h-28" />
        </Card>
    );
}
