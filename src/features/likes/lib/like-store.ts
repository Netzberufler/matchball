"use client";

import { createKeyedStore } from "@/lib/keyed-store";

export type LikeState = { isLiked: boolean; likeCount: number };

// Like states the viewer changed in this tab, by post id
export const likeStates = createKeyedStore<LikeState>();
