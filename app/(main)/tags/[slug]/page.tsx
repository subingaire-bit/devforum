// Licensed under MIT - DevForum Project
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { QuestionCard } from "@/components/questions/question-card";
import { getQuestions } from "@/lib/actions/question.actions";

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: { _count: { select: { questions: true } } },
  });

  if (!tag) {
    notFound();
  }

  const { questions } = await getQuestions({ tag: slug, page: 1, limit: 20 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">[{tag.name}]</h1>
          <p className="text-muted-foreground">
            {tag._count.questions} questions tagged
          </p>
        </div>
        <Link href="/tags" className="text-sm text-muted-foreground hover:text-foreground">
          ← All tags
        </Link>
      </div>

      {questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-12">
          No questions with this tag yet.
        </p>
      )}
    </div>
  );
}