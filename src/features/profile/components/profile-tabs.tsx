"use client";

import { useState, useTransition } from "react";
import { Button, Card, EmptyState, Tabs } from "@heroui/react";
import { loadMatchStats } from "@/features/matches/actions/load-match-stats";
import { loadMatches } from "@/features/matches/actions/load-matches";
import { MatchList } from "@/features/matches/components/match-list";
import {
    MatchStatsCards,
    MatchStatsCardsFallback,
} from "@/features/matches/components/match-stats-cards";
import { MatchTable } from "@/features/matches/components/match-table";
import type { MatchCursor, UserMatch } from "@/features/matches/lib/queries";
import type { StatsMatch } from "@/features/matches/utils/match-stats";
import type { FeedPage } from "@/features/posts/utils/feed";

type ProfileTab = "posts" | "matches";

type MatchesPage = FeedPage<UserMatch, MatchCursor>;

// Whose matches the "Matches" tab shows, and how it's worded
export type ProfileMatchesUser = {
    id: string;
    label: string;
    emptyMessage: string;
};

// The profile's posts and matches, one tab each. "Posts" shows `posts`;
// "Matches" loads its first page, and all matches for the statistics above
// it, when it's first opened. Both keep what
// they loaded while switching tabs: the posts panel stays mounted (hidden),
// and the matches page is kept here. Without `matchesUser` (while the page
// loads), the tabs are disabled.
export function ProfileTabs({
    posts,
    matchesUser,
}: {
    posts: React.ReactNode;
    matchesUser: ProfileMatchesUser | null;
}) {
    const [selected, setSelected] = useState<ProfileTab>("posts");
    const [matchesPage, setMatchesPage] = useState<MatchesPage | null>(null);
    const [statsMatches, setStatsMatches] = useState<StatsMatch[] | null>(null);
    const [matchesFailed, setMatchesFailed] = useState(false);
    const [, startTransition] = useTransition();

    function loadFirstMatchesPage(user: ProfileMatchesUser) {
        setMatchesFailed(false);
        startTransition(async () => {
            try {
                const [page, stats] = await Promise.all([
                    loadMatches(user.id, null),
                    loadMatchStats(user.id),
                ]);
                setMatchesPage(page);
                setStatsMatches(stats);
            } catch {
                setMatchesFailed(true);
            }
        });
    }

    function select(key: unknown) {
        if (key !== "posts" && key !== "matches") {
            return;
        }
        setSelected(key);
        if (key === "matches" && matchesUser && !matchesPage) {
            loadFirstMatchesPage(matchesUser);
        }
    }

    return (
        <Tabs
            selectedKey={selected}
            onSelectionChange={select}
            isDisabled={!matchesUser}
        >
            {/* Only as wide as the tabs, at the start */}
            <Tabs.ListContainer className="w-fit max-w-full self-start">
                <Tabs.List aria-label="Profile">
                    <Tabs.Tab id="posts">
                        Posts
                        {/* Without the sliding animation, which can leave
                            it off its tab when the page appears */}
                        <Tabs.Indicator className="transition-none" />
                    </Tabs.Tab>
                    <Tabs.Tab id="matches">
                        Matches
                        <Tabs.Indicator className="transition-none" />
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs.ListContainer>
            <Tabs.Panel
                id="posts"
                // Stays mounted, so the loaded posts stay; React Aria makes
                // it inert while hidden, and this hides it
                shouldForceMount
                // Flush with the tab list, without the default padding
                className="px-0 pt-4 pb-0 data-inert:hidden"
            >
                {posts}
            </Tabs.Panel>
            <Tabs.Panel id="matches" className="px-0 pt-4 pb-0">
                {matchesUser && matchesPage && statsMatches ? (
                    <div className="flex flex-col gap-6">
                        {/* Like on /matches, none without matches */}
                        {statsMatches.length > 0 && (
                            <MatchStatsCards matches={statsMatches} />
                        )}
                        <MatchList
                            userId={matchesUser.id}
                            page={matchesPage}
                            onPageChange={(update) =>
                                setMatchesPage((current) =>
                                    update(current ?? matchesPage),
                                )
                            }
                            label={matchesUser.label}
                            emptyMessage={matchesUser.emptyMessage}
                        />
                    </div>
                ) : matchesUser && matchesFailed ? (
                    <Card>
                        <EmptyState className="flex flex-col items-center gap-3 text-center">
                            <p role="alert">Couldn&apos;t load the matches.</p>
                            <Button
                                variant="tertiary"
                                onPress={() =>
                                    loadFirstMatchesPage(matchesUser)
                                }
                            >
                                Try again
                            </Button>
                        </EmptyState>
                    </Card>
                ) : (
                    <div className="flex flex-col gap-6">
                        <MatchStatsCardsFallback />
                        <MatchTable matches={null} />
                    </div>
                )}
            </Tabs.Panel>
        </Tabs>
    );
}
