// Licensed under MIT - DevForum Project
import { z } from "zod";

export const voteSchema = z.object({
  targetId: z.string().cuid("Invalid target ID"),
  targetType: z.enum(["question", "answer"], {
    errorMap: () => ({ message: "Target type must be 'question' or 'answer'" }),
  }),
  value: z.number().int().refine((val) => val === 1 || val === -1, {
    message: "Vote value must be 1 (upvote) or -1 (downvote)",
  }),
});

export type VoteInput = z.infer<typeof voteSchema>;