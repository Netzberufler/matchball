// Shared by the add match form, which checks its data before sending it,
// and the createMatch action, which checks it again before saving. Written
// with zod/mini, as the form uses it in the browser.
import * as z from "zod/mini";
import { parseEnteredScore } from "@/features/matches/utils/match-score";
import { formFields, formText } from "@/lib/form-validation";

// Field names of the add match form
export const PLAYED_AT_FIELD = "playedAt";
export const OPPONENT_FIELD = "opponentId";
export const SET_NUMBERS = [1, 2, 3] as const;

type ScoreFieldName = `set${1 | 2 | 3}${"Own" | "Opponent"}`;

export function scoreField(
    set: 1 | 2 | 3,
    side: "own" | "opponent",
): ScoreFieldName {
    return `set${set}${side === "own" ? "Own" : "Opponent"}`;
}

const SCORE_FIELDS = SET_NUMBERS.flatMap((set) => [
    scoreField(set, "own"),
    scoreField(set, "opponent"),
]);

// Every field the form sends. Nothing else is read from the form data.
const MATCH_FORM_FIELDS = [PLAYED_AT_FIELD, OPPONENT_FIELD, ...SCORE_FIELDS];

// The earliest year a match can have been played
const MIN_PLAYED_YEAR = 1900;

const PLAYED_AT_MESSAGE = "Choose the day you played, today or earlier";
const OPPONENT_MESSAGE = "Choose your opponent";
const SCORE_MESSAGE = "Scores are whole numbers";

export type MatchFormError =
    | { field: typeof PLAYED_AT_FIELD | typeof OPPONENT_FIELD; message: string }
    | { field: "score"; set: 1 | 2 | 3; message: string };

// A score field: empty (null) or a whole number. Its length is checked
// first, so only short text reaches the other checks. The tennis rules,
// including each set's highest score, are checked for the whole score
// below.
const scoreNumber = formText(
    z.pipe(
        z
            .string(SCORE_MESSAGE)
            .check(
                z.maxLength(3, SCORE_MESSAGE),
                z.regex(/^\d*$/, SCORE_MESSAGE),
            ),
        z.transform((value) => (value === "" ? null : Number(value))),
    ),
);

// The day played, as midnight UTC (see parsePlayedAt)
const playedAtSchema = formText(
    z.pipe(
        z.string(PLAYED_AT_MESSAGE).check(z.maxLength(10, PLAYED_AT_MESSAGE)),
        z.transform((value, ctx) => {
            const date = parsePlayedAt(value);
            if (!date) {
                ctx.issues.push({
                    code: "custom",
                    message: PLAYED_AT_MESSAGE,
                    input: value,
                });
                return z.NEVER;
            }
            return date;
        }),
    ),
);

// A user id
const opponentIdSchema = formText(
    z.pipe(
        z.string(OPPONENT_MESSAGE).check(z.maxLength(36, OPPONENT_MESSAGE)),
        z.uuid(OPPONENT_MESSAGE),
    ),
);

// Everything the add match form sends. Gives the day played, the
// opponent's user id and the score as Match columns with the user as
// player 1. Whether the opponent exists, and isn't the user, needs the
// database and the session, so createMatch checks that.
export const matchFormSchema = z.pipe(
    z.object({
        [PLAYED_AT_FIELD]: playedAtSchema,
        [OPPONENT_FIELD]: opponentIdSchema,
        set1Own: scoreNumber,
        set1Opponent: scoreNumber,
        set2Own: scoreNumber,
        set2Opponent: scoreNumber,
        set3Own: scoreNumber,
        set3Opponent: scoreNumber,
    } satisfies Record<(typeof MATCH_FORM_FIELDS)[number], z.ZodMiniType>),
    z.transform((fields, ctx) => {
        const { score, error } = parseEnteredScore([
            { own: fields.set1Own, opponent: fields.set1Opponent },
            { own: fields.set2Own, opponent: fields.set2Opponent },
            { own: fields.set3Own, opponent: fields.set3Opponent },
        ]);
        if (error) {
            ctx.issues.push({
                code: "custom",
                message: error.message,
                path: ["score", error.set],
                input: fields,
            });
            return z.NEVER;
        }
        return {
            playedAt: fields[PLAYED_AT_FIELD],
            opponentId: fields[OPPONENT_FIELD],
            score,
        };
    }),
);

export type MatchForm = z.output<typeof matchFormSchema>;

// Checks the add match form's data. Only its own fields are read.
export function parseMatchForm(formData: FormData) {
    return matchFormSchema.safeParse(formFields(formData, MATCH_FORM_FIELDS));
}

// The first problem Zod found, as the form shows it: at the date, the
// opponent, or below the scores, with the set it's about
export function toMatchFormError(error: z.core.$ZodError): MatchFormError {
    const [field, set] = error.issues[0]?.path ?? [];
    const message = error.issues[0]?.message ?? SCORE_MESSAGE;
    if (field === PLAYED_AT_FIELD || field === OPPONENT_FIELD) {
        return { field, message };
    }
    // A score field's own check (path "set2Own"), or the rules for the
    // whole score (path ["score", 2])
    const setNumber =
        field === "score"
            ? Number(set)
            : Number(/^set(\d)/.exec(String(field))?.[1]);
    return {
        field: "score",
        set: setNumber === 2 || setNumber === 3 ? setNumber : 1,
        message,
    };
}

// The date picker's "2026-10-28" as midnight UTC, like Match.playedAt
// stores it. Null if it isn't a real date, is before MIN_PLAYED_YEAR or is
// in the future. A day after today in UTC is allowed, as it's already
// today east of UTC.
function parsePlayedAt(value: string, now = new Date()) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
        return null;
    }
    const [year, month, day] = match.slice(1).map(Number) as [
        number,
        number,
        number,
    ];
    const date = new Date(Date.UTC(year, month - 1, day));
    // Rejects dates like February 30, which Date.UTC moves to March
    if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        return null;
    }
    const tomorrow = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
    );
    return year >= MIN_PLAYED_YEAR && date.getTime() <= tomorrow ? date : null;
}
