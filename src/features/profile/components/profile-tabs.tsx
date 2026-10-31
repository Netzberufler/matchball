"use client";

import { useState } from "react";
import { Tabs } from "@heroui/react";
import { Medal, Newspaper, Swords } from "lucide-react";
import { RetryCard } from "@/components/ui/list-card";
import { loadMatches } from "@/features/matches/actions/load-matches";
import {
    FilterableMatchTable,
    MatchesHeading,
} from "@/features/matches/components/filterable-match-table";
import {
    MatchStatsCards,
    MatchStatsCardsFallback,
} from "@/features/matches/components/match-stats-cards";
import { MatchTable } from "@/features/matches/components/match-table";
import type { UserMatch } from "@/features/matches/lib/queries";
import { useOnDemand } from "@/lib/use-on-demand";

type ProfileTab = "posts" | "matches" | "achievements";

// Whose matches the "Matches" tab shows, how it's worded, and where its
// "Add new" link goes (with them as the opponent, unless it's the viewer)
export type ProfileMatchesUser = {
    id: string;
    addMatchHref: string;
    label: string;
    emptyMessage: string;
};

// The profile's posts and matches, one tab each. "Posts" shows `posts`;
// "Matches" loads all the player's matches when it's first opened, and
// shows their statistics and the matches to filter, like /matches. Both keep what they loaded while switching tabs: the posts
// panel stays mounted (hidden), and the matches are kept here. Without `matchesUser` (while the page
// loads), the tabs are disabled. "Achievements" is a placeholder for now,
// with an empty panel.
export function ProfileTabs({
    posts,
    matchesUser,
}: {
    posts: React.ReactNode;
    matchesUser: ProfileMatchesUser | null;
}) {
    const [selected, setSelected] = useState<ProfileTab>("posts");
    // A refreshed page (e.g. after a match was saved or a name changed)
    // brings a new matchesUser, and the loaded matches are loaded again
    const onDemand = useOnDemand<"matches", UserMatch[]>({
        load: () =>
            matchesUser
                ? loadMatches(matchesUser.id)
                : Promise.reject(new Error("No user yet")),
        shownKey: selected === "matches" ? "matches" : null,
        refreshKey: matchesUser,
    });
    const matches = onDemand.data("matches");

    function select(key: unknown) {
        if (key !== "posts" && key !== "matches" && key !== "achievements") {
            return;
        }
        setSelected(key);
        if (key === "matches" && matchesUser) {
            onDemand.open("matches");
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
                    <Tabs.Tab id="posts" className="gap-1.5">
                        <Newspaper className="size-4" aria-hidden />
                        Posts
                        {/* Without the sliding animation, which can leave
                            it off its tab when the page appears */}
                        <Tabs.Indicator className="transition-none" />
                    </Tabs.Tab>
                    <Tabs.Tab id="matches" className="gap-1.5">
                        {/* The same icon as Matches in the main nav */}
                        <Swords className="size-4" aria-hidden />
                        Matches
                        <Tabs.Indicator className="transition-none" />
                    </Tabs.Tab>
                    <Tabs.Tab id="achievements" className="gap-1.5">
                        {/* The same icon as Achievements in the main nav */}
                        <Medal className="size-4" aria-hidden />
                        Achievements
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
                {matchesUser && matches ? (
                    <div className="flex flex-col gap-6">
                        {/* Like on /matches, none without matches */}
                        {matches.length > 0 && (
                            <MatchStatsCards matches={matches} />
                        )}
                        <FilterableMatchTable
                            matches={matches}
                            addMatchHref={matchesUser.addMatchHref}
                            label={matchesUser.label}
                            emptyMessage={matchesUser.emptyMessage}
                        />
                    </div>
                ) : matchesUser && onDemand.failed("matches") ? (
                    <RetryCard
                        message="Couldn't load the matches."
                        onRetry={() => onDemand.open("matches")}
                    />
                ) : (
                    <div className="flex flex-col gap-6">
                        <MatchStatsCardsFallback />
                        <section className="flex flex-col gap-3">
                            <MatchesHeading />
                            <MatchTable matches={null} />
                        </section>
                    </div>
                )}
            </Tabs.Panel>
            {/* Placeholder until achievements are implemented */}
            <Tabs.Panel id="achievements" className="px-0 pt-4 pb-0">
                {null}
            </Tabs.Panel>
        </Tabs>
    );
}
