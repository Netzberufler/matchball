import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "./db";

// Every seeded user can sign in with their username or email and this password
const SEED_PASSWORD = "matchball123";
// Seeded users are recognised by this email domain and replaced on each run
const SEED_EMAIL_DOMAIN = "seed.matchball.test";

const SEED_USERS = [
    { username: "anna_baseline", name: "Anna Becker" },
    { username: "max_volley", name: "Max Hoffmann" },
    { username: "lena_ace", name: "Lena Schulz" },
    { username: "jonas_topspin", name: "Jonas Wagner" },
    { username: "sophie_slice", name: "Sophie Klein" },
];

const MIN_POSTS_PER_USER = 3;
const MAX_POSTS_PER_USER = 20;
const MIN_TOTAL_POSTS = 50;
const MAX_TOTAL_POSTS = 60;
// Posts are spread over this many days before now
const POST_PERIOD_DAYS = 60;
// Each seed user follows this many of the other seed users
const MIN_FOLLOWING_PER_USER = 2;
const MAX_FOLLOWING_PER_USER = 4;
// The chance that a seed user likes a post by another seed user
const LIKE_CHANCE = 0.4;
// The chance that a seed user replies to a post by another seed user
const COMMENT_CHANCE = 0.15;
// The chance that a seed user likes a reply by another seed user
const COMMENT_LIKE_CHANCE = 0.3;

const COMMENT_TEXTS = [
    "Love this!",
    "Same here, every single time.",
    "Count me in!",
    "Great progress, keep it up!",
    "Haha, so true.",
    "Which court are you playing on?",
    "Let's hit together next week.",
    "Respect! That's a tough one.",
    "Good luck out there!",
    "I need to try that too.",
    "Totally agree.",
    "What racket are you using?",
];

const POST_TEXTS = [
    "Great hitting session this morning. The backhand finally feels right!",
    "Anyone up for doubles on Saturday? Looking for a fourth player.",
    "Lost in a third-set tiebreak today. Still proud of the fight.",
    "New strings, new me. Full poly at 23 kg, let's see how it goes.",
    "Clay season is here and my socks will never be white again.",
    "Serve practice: 100 first serves, 61 in. Progress!",
    "Who else plays better in the wind than without it? Just me?",
    "Finally won my club championship first round match 6-4 6-3.",
    "Footwork drills are boring but they work. Lesson learned.",
    "Looking for a hitting partner around NTRP 4.0 on weekday evenings.",
    "Rain delay. Again. Indoor courts are fully booked, of course.",
    "That moment when your drop shot actually lands where you wanted.",
    "Doubles tip: talk to your partner after every point, win or lose.",
    "Tried the two-handed backhand slice today. Not a fan.",
    "Our team made it to the league playoffs! Let's go!",
    "Recovery day: stretching, foam rolling and watching old Federer matches.",
    "My forehand was on fire today. My serve was somewhere else entirely.",
    "Anyone know a good racket stringer near the city centre?",
    "Played my first tournament this weekend. Nervous but so much fun.",
    "Hard courts are tough on the knees. Investing in better shoes.",
    "Practised returns for an hour. Second serve returns are my new focus.",
    "Night tennis under the lights hits different.",
    "Mixed doubles social tonight, bring snacks and good vibes.",
    "Grip change made all the difference. Coach was right, as always.",
    "Down a set and 2-5, came back to win. Never give up!",
    "Just booked court 3 for Thursday 7pm. Who's in?",
    "Tennis elbow is back. Taking a week off, sadly.",
    "Watched the final last night. What a match!",
    "Warm-up routine matters more than I thought. 15 minutes, every time.",
    "New balls, please! Ours were flatter than pancakes.",
    "Today's goal: fewer unforced errors. Result: slightly fewer.",
    "Volleys feel so much more natural when I stop overthinking them.",
    "Junior clinic was amazing today. The kids have more energy than me.",
    "Is it just me or does every opponent have a weird serve motion?",
    "Moonballing my way to victory. Not pretty, but it counts.",
    "Bought a ball machine. My partner says I'm replacing them.",
    "Early morning tennis before work is the best start to the day.",
    "Lost the match but won the post-match beers. Balanced day.",
    "Working on my kick serve. My shoulder has opinions about it.",
    "Club ladder update: moved up two spots this week!",
];

function randomInt(min: number, max: number) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

// A random number of posts per user, re-rolled until the total is in range
function randomPostCounts() {
    for (;;) {
        const counts = SEED_USERS.map(() =>
            randomInt(MIN_POSTS_PER_USER, MAX_POSTS_PER_USER),
        );
        const total = counts.reduce((sum, count) => sum + count, 0);
        if (total >= MIN_TOTAL_POSTS && total <= MAX_TOTAL_POSTS) {
            return counts;
        }
    }
}

// A shuffled copy (Fisher-Yates)
function shuffle<T>(items: T[]) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
}

function randomPastDate() {
    return new Date(
        Date.now() - Math.random() * POST_PERIOD_DAYS * 24 * 60 * 60 * 1000,
    );
}

async function main() {
    // Remove earlier seed data; posts, comments, likes, follows, sessions
    // and accounts cascade
    await prisma.user.deleteMany({
        where: { email: { endsWith: `@${SEED_EMAIL_DOMAIN}` } },
    });

    const passwordHash = await hashPassword(SEED_PASSWORD);
    const postCounts = randomPostCounts();
    const userIds: string[] = [];

    for (const [index, seedUser] of SEED_USERS.entries()) {
        const user = await prisma.user.create({
            data: {
                ...seedUser,
                email: `${seedUser.username}@${SEED_EMAIL_DOMAIN}`,
                emailVerified: true,
            },
        });

        // An email/password account like Better Auth creates on sign-up
        await prisma.account.create({
            data: {
                providerId: "credential",
                accountId: user.id,
                userId: user.id,
                password: passwordHash,
            },
        });
        userIds.push(user.id);

        const posts = Array.from(
            { length: postCounts[index] ?? MIN_POSTS_PER_USER },
            () => ({
                authorId: user.id,
                content: POST_TEXTS[randomInt(0, POST_TEXTS.length - 1)] ?? "",
                createdAt: randomPastDate(),
            }),
        );
        await prisma.post.createMany({ data: posts });
    }

    // Each user follows a random few of the others
    const follows = userIds.flatMap((followerId) =>
        shuffle(userIds.filter((id) => id !== followerId))
            .slice(0, randomInt(MIN_FOLLOWING_PER_USER, MAX_FOLLOWING_PER_USER))
            .map((followingId) => ({ followerId, followingId })),
    );
    await prisma.follow.createMany({ data: follows });

    // Each user likes some of the other users' posts
    const seedPosts = await prisma.post.findMany({
        where: { authorId: { in: userIds } },
        select: { id: true, authorId: true, createdAt: true },
    });
    const likes = userIds.flatMap((userId) =>
        seedPosts
            .filter(
                (post) =>
                    post.authorId !== userId && Math.random() < LIKE_CHANCE,
            )
            .map((post) => ({ postId: post.id, userId })),
    );
    await prisma.like.createMany({ data: likes });

    // Each user replies to a few of the other users' posts, some time after
    // they were posted
    const comments = userIds.flatMap((authorId) =>
        seedPosts
            .filter(
                (post) =>
                    post.authorId !== authorId &&
                    Math.random() < COMMENT_CHANCE,
            )
            .map((post) => ({
                postId: post.id,
                authorId,
                content:
                    COMMENT_TEXTS[randomInt(0, COMMENT_TEXTS.length - 1)] ?? "",
                createdAt: new Date(
                    post.createdAt.getTime() +
                        Math.random() * (Date.now() - post.createdAt.getTime()),
                ),
            })),
    );
    await prisma.comment.createMany({ data: comments });

    // Each user likes some of the other users' replies
    const seedComments = await prisma.comment.findMany({
        where: { authorId: { in: userIds } },
        select: { id: true, authorId: true },
    });
    const commentLikes = userIds.flatMap((userId) =>
        seedComments
            .filter(
                (comment) =>
                    comment.authorId !== userId &&
                    Math.random() < COMMENT_LIKE_CHANCE,
            )
            .map((comment) => ({ commentId: comment.id, userId })),
    );
    await prisma.commentLike.createMany({ data: commentLikes });

    // Count the likes on every reply, and the likes and comments on every
    // post. This also corrects ones by other users that lost likes or
    // comments when the old seed users were deleted above.
    await prisma.$executeRaw`
        UPDATE "Comment" SET "likeCount" = (
            SELECT COUNT(*) FROM "CommentLike"
            WHERE "CommentLike"."commentId" = "Comment"."id"
        )`;
    await prisma.$executeRaw`
        UPDATE "Post" SET
            "likeCount" = (
                SELECT COUNT(*) FROM "Like" WHERE "Like"."postId" = "Post"."id"
            ),
            "commentCount" = (
                SELECT COUNT(*) FROM "Comment"
                WHERE "Comment"."postId" = "Post"."id"
            )`;

    console.log(
        `Seeded ${SEED_USERS.length} users, ${postCounts.reduce((sum, count) => sum + count, 0)} posts, ${follows.length} follows, ${likes.length} likes, ${comments.length} comments and ${commentLikes.length} comment likes (password: ${SEED_PASSWORD})`,
    );
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
