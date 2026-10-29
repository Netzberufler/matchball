import { describe, expect, it } from "vitest";
import {
    getNotificationFilter,
    isNotificationFilter,
    NOTIFICATION_FILTERS,
} from "@/features/notifications/utils/notification-filters";

describe("NOTIFICATION_FILTERS", () => {
    it("has a unique key and type per tab", () => {
        const keys = NOTIFICATION_FILTERS.map((filter) => filter.key);
        const types = NOTIFICATION_FILTERS.map((filter) => filter.type);
        expect(new Set(keys).size).toBe(keys.length);
        expect(new Set(types).size).toBe(types.length);
    });

    it("starts with the tab that shows everything", () => {
        expect(NOTIFICATION_FILTERS[0]).toMatchObject({
            key: "all",
            type: null,
        });
    });
});

describe("isNotificationFilter", () => {
    it.each(["all", "followers", "mentions", "replies", "likes"])(
        "accepts %s",
        (value) => {
            expect(isNotificationFilter(value)).toBe(true);
        },
    );

    it.each(["", "FOLLOW", "Likes", "toString", null, undefined])(
        "refuses %j",
        (value) => {
            expect(isNotificationFilter(value)).toBe(false);
        },
    );
});

describe("getNotificationFilter", () => {
    it("returns the tab for a key", () => {
        expect(getNotificationFilter("likes")).toMatchObject({
            label: "Likes",
            type: "LIKE",
        });
    });
});
