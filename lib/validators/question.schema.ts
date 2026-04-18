// Licensed under MIT - DevForum Project
import { z } from "zod";

export const questionCreateSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  content: z
    .string()
    .min(50, "Question content must be at least 50 characters")
    .max(50000, "Content exceeds maximum length")
    .trim(),
  tags: z
    .array(z.string().min(1).max(50))
    .min(1, "At least one tag is required")
    .max(5, "Maximum 5 tags allowed"),
  published: z.boolean().default(true),
});

export const questionUpdateSchema = questionCreateSchema.partial();

export const questionFilterSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["newest", "oldest", "votes", "answers"]).default("newest"),
  tag: z.string().optional(),
  search: z.string().optional(),
  author: z.string().optional(),
});

export type QuestionCreateInput = z.infer<typeof questionCreateSchema>;
export type QuestionUpdateInput = z.infer<typeof questionUpdateSchema>;
export type QuestionFilterInput = z.infer<typeof questionFilterSchema>;