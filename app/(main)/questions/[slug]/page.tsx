// Licensed under MIT - DevForum Project
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";  // ✅ Fixed: Import from lib/auth
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TagBadge } from "@/components/questions/tag-badge";
import { MarkdownRenderer } from "@/components/questions/markdown-renderer";
import { VoteButtons } from "@/components/questions/vote-buttons";
import { AnswerForm } from "@/components/questions/answer-form";
import { AnswerItem } from "@/components/questions/answer-item";
import { getQuestionBySlug } from "@/lib/actions/question.actions";
import { formatRelativeDate } from "@/lib/utils";
import type { Tag, Answer } from "@prisma/client";

// ✅ Define minimal types for the page (or import from types/question.types)
type QuestionDetail = {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  createdAt: Date;
  views?: number;
  voteCount?: number;
  author: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  tags: Tag[];
  answers: (Answer & {
    author: { id: string; name: string | null; username: string | null; image: string | null };
    voteCount?: number;
    accepted?: boolean;
  })[];
  _count: { answers: number };
};

interface QuestionDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const { slug } = await params;
  
  // ✅ Type assertion for now (until getQuestionBySlug has proper return type)
  const question = await getQuestionBySlug(slug) as QuestionDetail | null;
  const session = await auth();

  if (!question) {
    notFound();
  }

  const isAuthor = session?.user?.id === question.authorId;

  return (
    <article className="space-y-8">
      {/* Question Header */}
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            {question.title}
          </h1>
          <div className="flex items-center gap-2">
            {isAuthor && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/questions/edit/${question.slug}`}>Edit</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <Link 
            // ✅ Fixed: Use username fallback + safe path
            href={`/users/${question.author.username ?? question.author.id}`}
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={question.author.image ?? undefined} />
              <AvatarFallback>
                {question.author.name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <span>{question.author.username ?? question.author.name ?? "Anonymous"}</span>
          </Link>
          <time dateTime={question.createdAt.toISOString()}>
            asked {formatRelativeDate(question.createdAt)}
          </time>
          <span>• {question.views ?? 0} views</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {question.tags?.map((tag: Tag) => (
            <TagBadge key={tag.id} name={tag.name} slug={tag.slug ?? tag.name} />
          ))}
        </div>
      </header>

      {/* Question Content + Voting */}
      <div className="flex gap-6">
        <VoteButtons
          targetId={question.id}
          targetType="question"
          initialVoteCount={question.voteCount ?? 0}
          userVote={null}
          className="pt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <MarkdownRenderer content={question.content} />
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <section className="space-y-6 pt-6 border-t">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {question._count?.answers ?? 0} Answers
          </h2>
        </div>

        {/* Accepted answer first */}
        {question.answers?.filter((a: Answer) => a.accepted).map((answer) => (
          <AnswerItem
            key={answer.id}
            // ✅ Type assertion for AnswerItem props
            answer={answer as any}
            isQuestionAuthor={isAuthor}
          />
        ))}

        {/* Other answers */}
        {question.answers
          ?.filter((a: Answer) => !a.accepted)
          .map((answer) => (
            <AnswerItem
              key={answer.id}
              answer={answer as any}
              isQuestionAuthor={isAuthor}
            />
          ))}

        {/* Answer Form */}
        {session?.user ? (
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
            <AnswerForm 
              questionId={question.id}
              onAnswerPosted={() => {}}
            />
          </div>
        ) : (
          <div className="p-6 border rounded-lg text-center bg-muted/30">
            <p className="text-muted-foreground mb-4">
              Please sign in to post an answer
            </p>
            <Button asChild>
              {/* ✅ Fixed: Use /auth/login to match your file structure */}
              <Link href={`/auth/login?callbackUrl=/questions/${question.slug}`}>
                Sign In
              </Link>
            </Button>
          </div>
        )}
      </section>
    </article>
  );
}