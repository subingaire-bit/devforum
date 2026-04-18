// Licensed under MIT - DevForum Project
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/utils";
import { answerCreateSchema, answerAcceptSchema } from "@/lib/validators/answer.schema";
import { invalidatePattern } from "@/lib/redis";

export async function createAnswer(rawInput: { questionId: string; content: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const input = answerCreateSchema.parse(rawInput);
  
  const question = await prisma.question.findUnique({
    where: { id: input.questionId },
  });
  if (!question) throw new Error("Question not found");

  const answer = await prisma.answer.create({
    data: {
      content: sanitizeInput(input.content),
      questionId: input.questionId,
      authorId: session.user.id,
    },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      votes: true,
      question: { select: { id: true, slug: true } },
    },
  });

  const answerWithCounts = {
    ...answer,
    voteCount: answer.votes.reduce((sum: number, v: { value: number }) => sum + v.value, 0),
    _count: { votes: answer.votes.length },
  };

  await invalidatePattern?.(`question:${question.slug}`);
  revalidatePath(`/questions/${question.slug}`);
  
  return { success: true, answer: answerWithCounts };
}

export async function updateAnswer(answerId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    include: { 
      question: { select: { id: true, slug: true, authorId: true } },
      votes: true,
    },
  });
  if (!answer) throw new Error("Answer not found");
  if (answer.authorId !== session.user.id) throw new Error("Forbidden");

  const updated = await prisma.answer.update({
    where: { id: answerId },
    data: { content: sanitizeInput(content) },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      votes: true,
      question: { select: { id: true, slug: true } },
    },
  });

  const updatedWithCounts = {
    ...updated,
    voteCount: updated.votes.reduce((sum: number, v: { value: number }) => sum + v.value, 0),
    _count: { votes: updated.votes.length },
  };

  await invalidatePattern?.(`question:${updated.question.slug}`);
  revalidatePath(`/questions/${updated.question.slug}`);
  
  return { success: true, answer: updatedWithCounts };
}

export async function deleteAnswer(answerId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    include: { question: { select: { id: true, slug: true } } },
  });
  if (!answer) throw new Error("Answer not found");
  if (answer.authorId !== session.user.id) throw new Error("Forbidden");

  await prisma.answer.delete({ where: { id: answerId } });
  
  await invalidatePattern?.(`question:${answer.question.slug}`);
  revalidatePath(`/questions/${answer.question.slug}`);
  
  return { success: true };
}

export async function acceptAnswer(rawInput: { answerId: string; questionId: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { answerId, questionId } = answerAcceptSchema.parse(rawInput);
  
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { author: { select: { id: true } } },
  });
  if (!question) throw new Error("Question not found");
  if (question.authorId !== session.user.id) throw new Error("Forbidden");

  await prisma.answer.updateMany({
    where: { questionId, accepted: true },
    data: { accepted: false },
  });

  const accepted = await prisma.answer.update({
    where: { id: answerId, questionId },
    data: { accepted: true },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
      votes: true,
      question: { select: { id: true, slug: true } },
    },
  });

  const acceptedWithCounts = {
    ...accepted,
    voteCount: accepted.votes.reduce((sum: number, v: { value: number }) => sum + v.value, 0),
    _count: { votes: accepted.votes.length },
  };

  await invalidatePattern?.(`question:${question.slug}`);
  revalidatePath(`/questions/${question.slug}`);
  
  return { success: true, answer: acceptedWithCounts };
}