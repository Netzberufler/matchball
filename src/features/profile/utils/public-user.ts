import type { Prisma } from "@/prisma/generated/client";

// What everyone may see of a user, wherever they're shown: on posts,
// comments, matches, in lists, searches and chats. For Prisma `select`s.
export const publicUserSelect = {
    id: true,
    username: true,
    name: true,
    image: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
    select: typeof publicUserSelect;
}>;
