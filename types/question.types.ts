// Licensed under MIT - DevForum Project
import { Question, Answer, Tag, User } from "@prisma/client";

export type QuestionWithRelations = Question & {
  author: Pick<User, "id" | "name" | "username" | "image">;
  tags: Tag[];
  _count: { answers: number };
  voteCount: number;
};

export type AnswerWithRelations = Answer & {
  author: Pick<User, "id" | "name" | "username" | "image">;
  _count: { votes: number };
  voteCount: number;
};

export type QuestionDetail = QuestionWithRelations & {
  content: string;
  answers: AnswerWithRelations[];
  views: number;
};

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}