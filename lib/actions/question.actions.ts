// Licensed under MIT - DevForum Project
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, sanitizeInput } from "@/lib/utils";
import { questionCreateSchema, questionUpdateSchema, questionFilterSchema } from "@/lib/validators/question.schema";
import { invalidatePattern } from "@/lib/redis";

export async function createQuestion(rawInput: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const input = questionCreateSchema.parse(rawInput);
  
  let slug = generateSlug(input.title);
  let uniqueSlug = slug;
  let counter = 1;
  while (await prisma.question.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${slug}-${counter++}`;
  }

  const question = await prisma.question.create({
    data: {
      title: sanitizeInput(input.title),
      slug: uniqueSlug,
      content: input.content,
      published: input.published,
      authorId: session.user.id,
      tags: {
        connectOrCreate: input.tags.map((tagName: string) => {
          const tagSlug = generateSlug(tagName);
          return {
            where: { slug: tagSlug },
            create: { name: tagName.toLowerCase(), slug: tagSlug },
          };
        }),
      },
    },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      tags: true,
      _count: { select: { answers: true, votes: true } },
      votes: { select: { value: true } },
    },
  });

  const questionWithCounts = {
    ...question,
    voteCount: question.votes.reduce((sum: number, v: { value: number }) => sum + v.value, 0),
  };

  await invalidatePattern?.("questions:*");
  revalidatePath("/questions");
  revalidatePath(`/questions/${uniqueSlug}`);
  return { success: true, question: questionWithCounts };
}

export async function updateQuestion(slug: string, rawInput: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const input = questionUpdateSchema.parse(rawInput);
  
  const question = await prisma.question.findUnique({
    where: { slug },
    include: { author: { select: { id: true } } },
  });
  if (!question) throw new Error("Question not found");
  if (question.authorId !== session.user.id) throw new Error("Forbidden");

  let updateData: any = { ...input };
  if (input.title && input.title !== question.title) {
    let newSlug = generateSlug(input.title);
    let uniqueSlug = newSlug;
    let counter = 1;
    while (await prisma.question.findFirst({ where: { slug: uniqueSlug, NOT: { id: question.id } } })) {
      uniqueSlug = `${newSlug}-${counter++}`;
    }
    updateData.slug = uniqueSlug;
  }
  if (input.tags) {
    updateData.tags = {
      set: [],
      connectOrCreate: input.tags.map((tagName: string) => {
        const tagSlug = generateSlug(tagName);
        return { where: { slug: tagSlug }, create: { name: tagName.toLowerCase(), slug: tagSlug } };
      }),
    };
  }

  const updated = await prisma.question.update({
    where: { id: question.id },
    data: updateData,
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      tags: true,
      _count: { select: { answers: true, votes: true } },
      votes: { select: { value: true } },
    },
  });

  const updatedWithCounts = {
    ...updated,
    voteCount: updated.votes.reduce((sum: number, v: { value: number }) => sum + v.value, 0),
  };

  await invalidatePattern?.("questions:*");
  revalidatePath("/questions");
  revalidatePath(`/questions/${slug}`);
  if (updatedWithCounts.slug !== slug) {
    revalidatePath(`/questions/${updatedWithCounts.slug}`);
    redirect(`/questions/${updatedWithCounts.slug}`);
  }
  return { success: true, question: updatedWithCounts };
}

export async function deleteQuestion(slug: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const question = await prisma.question.findUnique({ where: { slug }, include: { author: { select: { id: true } } } });
  if (!question) throw new Error("Question not found");
  if (question.authorId !== session.user.id) throw new Error("Forbidden");
  await prisma.question.delete({ where: { id: question.id } });
  await invalidatePattern?.("questions:*");
  revalidatePath("/questions");
  revalidatePath("/");
  return { success: true };
}

export async function getQuestions(filters?: any) {
  const parsed = questionFilterSchema.safeParse(filters || {});
  const { page = 1, limit = 10, sortBy = "newest", tag, search, author } = parsed.success ? parsed.data : {};
  const where: any = { published: true };
  if (tag) where.tags = { some: { slug: tag } };
  if (author) where.authorId = author;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }
  const orderBy: any = sortBy === "oldest" ? { createdAt: "asc" } : sortBy === "votes" ? { votes: { _sum: { value: "desc" } } } : sortBy === "answers" ? { answers: { _count: "desc" } } : { createdAt: "desc" };

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where, orderBy,
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
        tags: true,
        _count: { select: { answers: true } },
        votes: { select: { value: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.question.count({ where }),
  ]);

  const questionsWithVotes = questions.map((q: any) => ({
    ...q,
    voteCount: q.votes.reduce((sum: number, v: { value: number }) => sum + v.value, 0),
    votes: undefined,
  }));

  return {
    questions: questionsWithVotes,
    pagination: { page, limit, total, pages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
  };
}

export async function getQuestionBySlug(slug: string) {
  const question = await prisma.question.findUnique({
    where: { slug, published: true },
    include: {
      author: { select: { id: true, name: true, username: true, image: true, bio: true } },
      tags: true,
      answers: {
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          _count: { select: { votes: true } },
          votes: { select: { value: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      _count: { select: { answers: true, votes: true } },
      votes: { select: { value: true } },
    },
  });
  if (!question) return null;

  // Increment view count (fire-and-forget)
  prisma.question.update({ where: { id: question.id }, data: { views: { increment: 1 } } }).catch(() => {});

  return {
    ...question,
    voteCount: question.votes.reduce((sum: number, v: { value: number }) => sum + v.value, 0),
    views: (question.views ?? 0) + 1,
    answers: question.answers.map((a: any) => ({
      ...a,
      voteCount: a.votes.reduce((sum: number, v: { value: number }) => sum + v.value, 0),
      _count: { ...a._count, votes: a.votes.length },
      votes: undefined,
    })),
    votes: undefined,
  };
}