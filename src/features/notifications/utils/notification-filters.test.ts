import { describe, expect, it } from "vitest";
import {
    countActiveNotificationFilters,
    NO_NOTIFICATION_FILTERS,
    NOTIFICATION_TYPE_FILTERS,
    notificationFiltersKey,
    notificationsEmptyMessage,
    notificationTypes,
} from "@/features/notifications/utils/notification-filters";

describe("NOTIFICATION_TYPE_FILTERS", () => {
    it("has a unique key per option, and each type in one option", () => {
        const keys = NOTIFICATION_TYPE_FILTERS.map((filter) => filter.key);
        const types = NOTIFICATION_TYPE_FILTERS.flatMap(
            (filter) => filter.types,
        );
        expect(new Set(keys).size).toBe(keys.length);
        expect(new Set(types).size).toBe(types.length);
    });
});

describe("notificationTypes", () => {
    it("is null without types, to show them all", () => {
        expect(notificationTypes(NO_NOTIFICATION_FILTERS)).toBeNull();
    });

    it("groups the match notifications in one option", () => {
        expect(notificationTypes({ types: ["matches"], show: "all" })).toEqual([
            "MATCH_REQUEST",
            "MATCH_CONFIRMED",
            "MATCH_DECLINED",
            "MATCH_WITHDRAWN",
            "MATCH_UPDATED",
        ]);
    });

    it("combines the ticked options", () => {
        expect(
            notificationTypes({ types: ["likes", "followers"], show: "new" }),
        ).toEqual(["FOLLOW", "LIKE"]);
    });
});

describe("countActiveNotificationFilters", () => {
    it("counts each type, and showing only new ones", () => {
        expect(countActiveNotificationFilters(NO_NOTIFICATION_FILTERS)).toBe(0);
        expect(
            countActiveNotificationFilters({
                types: ["likes", "replies"],
                show: "new",
            }),
        ).toBe(3);
    });
});

describe("notificationFiltersKey", () => {
    it("is the same whatever order the types were ticked in", () => {
        expect(
            notificationFiltersKey({
                types: ["likes", "replies"],
                show: "all",
            }),
        ).toBe(
            notificationFiltersKey({
                types: ["replies", "likes"],
                show: "all",
            }),
        );
    });

    it("tells all and new apart", () => {
        expect(notificationFiltersKey({ types: [], show: "all" })).not.toBe(
            notificationFiltersKey({ types: [], show: "new" }),
        );
    });
});

describe("notificationsEmptyMessage", () => {
    it("says what shows up here without filters", () => {
        expect(notificationsEmptyMessage(NO_NOTIFICATION_FILTERS)).toMatch(
            /^No notifications yet\./,
        );
    });

    it("uses the option's message for one type", () => {
        expect(
            notificationsEmptyMessage({ types: ["likes"], show: "all" }),
        ).toBe("Nobody has liked your posts or replies yet.");
    });

    it("says there are no new ones when showing only new ones", () => {
        expect(notificationsEmptyMessage({ types: [], show: "new" })).toBe(
            "No new notifications.",
        );
        expect(
            notificationsEmptyMessage({
                types: ["likes", "mentions"],
                show: "new",
            }),
        ).toBe("No new notifications of these types.");
    });
});
