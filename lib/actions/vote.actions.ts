// Licensed under MIT - DevForum Project
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { voteSchema, type VoteInput } from "@/lib/validators/vote.schema";
import { invalidatePattern } from "@/lib/redis";

export async function castVote(rawInput: VoteInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { targetId, targetType, value } = voteSchema.parse(rawInput);
  const userId = session.user.id;

  // Verify target exists
  const target = targetType === "question"
    ? await prisma.question.findUnique({ where: { id: targetId, published: true } })
    : await prisma.answer.findUnique({ where: { id: targetId } });
    
  if (!target) {
    throw new Error(`${targetType} not found`);
  }

  // Use transaction to handle vote upsert and total calculation
  const result = await prisma.$transaction(async (tx) => {
    // Remove existing vote if same value (toggle off)
    const existing = await tx.vote.findFirst({
      where: {
        userId,
        ...(targetType === "question" 
          ? { questionId: targetId } 
          : { answerId: targetId }),
      },
    });

    if (existing?.value === value) {
      // Toggle off: delete the vote
      await tx.vote.delete({ where: { id: existing.id } });
    } else {
      // Upsert: create or update vote
      await tx.vote.upsert({
        where: {
          userId_questionId: targetType === "question" 
            ? { userId, questionId: targetId } 
            : { userId: "", questionId: "" }, // Fallback for answer
          userId_answerId: targetType === "answer"
            ? { userId, answerId: targetId }
            : { userId: "", answerId: "" },
        },
        update: { value },
        create: {
          userId,
          value,
          ...(targetType === "question" ? { questionId: targetId } : { answerId: targetId }),
        },
      });
    }

    // Return updated vote count
    if (targetType === "question") {
      const total = await tx.vote.aggregate({
        where: { questionId: targetId },
        _sum: { value: true },
      });
      return { voteCount: total._sum.value || 0 };
    } else {
      const total = await tx.vote.aggregate({
        where: { answerId: targetId },
        _sum: { value: true },
      });
      return { voteCount: total._sum.value || 0 };
    }
  });

  // Invalidate relevant caches
  if (targetType === "question") {
    const question = await prisma.question.findUnique({ where: { id: targetId } });
    if (question) {
      await invalidatePattern(`question:${question.slug}`);
      revalidatePath(`/questions/${question.slug}`);
    }
  } else {
    const answer = await prisma.answer.findUnique({ 
      where: { id: targetId },
      include: { question: { select: { slug: true } } }
    });
    if (answer) {
      await invalidatePattern(`question:${answer.question.slug}`);
      revalidatePath(`/questions/${answer.question.slug}`);
    }
  }
  
  return { success: true, voteCount: result.voteCount };
}

export async function getUserVote(targetId: string, targetType: "question" | "answer") {
  const session = await auth();
  if (!session?.user?.id) return null;

  const vote = await prisma.vote.findFirst({
    where: {
      userId: session.user.id,
      ...(targetType === "question" 
        ? { questionId: targetId } 
        : { answerId: targetId }),
    },
    select: { value: true },
  });

  return vote?.value || null;
}