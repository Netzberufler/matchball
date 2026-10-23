"use client";

import { createKeyedStore } from "@/lib/keyed-store";

// Comment counts that changed in this tab, by post id, e.g. after the
// viewer replied
export const commentCounts = createKeyedStore<number>();
