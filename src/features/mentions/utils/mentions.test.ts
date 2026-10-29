import { describe, expect, it } from "vitest";
import {
    findMentionBeforeCaret,
    findMentionedUsernames,
    MAX_MENTIONS,
    splitMentions,
    splitTypedMentions,
} from "@/features/mentions/utils/mentions";

describe("findMentionedUsernames", () => {
    it.each([
        ["@anna great match", ["anna"]],
        ["great match @anna", ["anna"]],
        ["hi @anna_b!", ["anna_b"]],
        ["(@anna)", ["anna"]],
        ["@anna.", ["anna"]],
        ["@anna and @ben_99", ["anna", "ben_99"]],
        ["line one\n@anna", ["anna"]],
    ])("finds the mentions in %j", (text, usernames) => {
        expect(findMentionedUsernames(text)).toEqual(usernames);
    });

    it.each([
        ["an email address", "write to me@mail.com"],
        ["a double @", "@@anna"],
        ["a username that is too short", "@ab"],
        ["a username that is too long", `@${"a".repeat(31)}`],
        ["a bare @", "meet @ 5"],
    ])("ignores %s", (_, text) => {
        expect(findMentionedUsernames(text)).toEqual([]);
    });

    it("accepts usernames of 3 to 30 characters", () => {
        expect(findMentionedUsernames(`@abc @${"a".repeat(30)}`)).toEqual([
            "abc",
            "a".repeat(30),
        ]);
    });

    it("lowercases the usernames and drops repeats", () => {
        expect(findMentionedUsernames("@Anna @anna @ANNA")).toEqual(["anna"]);
    });

    it(`keeps the first ${MAX_MENTIONS} usernames`, () => {
        const usernames = Array.from({ length: 12 }, (_, i) => `user${i}`);
        const text = usernames.map((username) => `@${username}`).join(" ");
        expect(findMentionedUsernames(text)).toEqual(
            usernames.slice(0, MAX_MENTIONS),
        );
    });
});

describe("splitMentions", () => {
    it("keeps the text whole without saved mentions", () => {
        expect(splitMentions("hi @anna", [])).toEqual([
            { type: "text", text: "hi @anna" },
        ]);
    });

    it("splits out the mentions of saved usernames only", () => {
        expect(splitMentions("hi @anna and @ben!", ["anna"])).toEqual([
            { type: "text", text: "hi " },
            { type: "mention", text: "@anna", username: "anna" },
            { type: "text", text: " and @ben!" },
        ]);
    });

    it("keeps the mention as typed, with its username lowercased", () => {
        expect(splitMentions("@Anna", ["anna"])).toEqual([
            { type: "mention", text: "@Anna", username: "anna" },
        ]);
    });

    it("has no empty text between mentions next to each other", () => {
        expect(splitMentions("@anna @ben", ["anna", "ben"])).toEqual([
            { type: "mention", text: "@anna", username: "anna" },
            { type: "text", text: " " },
            { type: "mention", text: "@ben", username: "ben" },
        ]);
    });

    it("has no parts for an empty text", () => {
        expect(splitMentions("", ["anna"])).toEqual([]);
    });
});

describe("splitTypedMentions", () => {
    it("splits out every mention", () => {
        expect(splitTypedMentions("hi @anna and @ben")).toEqual([
            { type: "text", text: "hi " },
            { type: "mention", text: "@anna", username: "anna" },
            { type: "text", text: " and " },
            { type: "mention", text: "@ben", username: "ben" },
        ]);
    });

    it("leaves email addresses as text", () => {
        expect(splitTypedMentions("me@mail.com")).toEqual([
            { type: "text", text: "me@mail.com" },
        ]);
    });
});

describe("findMentionBeforeCaret", () => {
    it.each([
        ["@", { start: 0, query: "" }],
        ["@an", { start: 0, query: "an" }],
        ["hi @", { start: 3, query: "" }],
        ["hi @An", { start: 3, query: "an" }],
        ["(@anna_b", { start: 1, query: "anna_b" }],
    ])("finds the mention being typed in %j", (text, mention) => {
        expect(findMentionBeforeCaret(text)).toEqual(mention);
    });

    it.each([
        ["no mention", "hi there"],
        ["a finished mention", "hi @anna "],
        ["an email address", "me@ma"],
        ["a username that is too long", `@${"a".repeat(31)}`],
        ["a character that can't be in a username", "@anna-"],
    ])("is null with %s", (_, text) => {
        expect(findMentionBeforeCaret(text)).toBeNull();
    });
});
