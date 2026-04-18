// Licensed under MIT - DevForum Project
import { z } from "zod";

export const answerCreateSchema = z.object({
  questionId: z.string().cuid("Invalid question ID"),
  content: z
    .string()
    .min(20, "Answer must be at least 20 characters")
    .max(30000, "Answer exceeds maximum length")
    .trim(),
});

export const answerUpdateSchema = answerCreateSchema.partial();

export const answerAcceptSchema = z.object({
  answerId: z.string().cuid("Invalid answer ID"),
  questionId: z.string().cuid("Invalid question ID"),
});

export type AnswerCreateInput = z.infer<typeof answerCreateSchema>;
export type AnswerUpdateInput = z.infer<typeof answerUpdateSchema>;