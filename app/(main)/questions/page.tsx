// Licensed under MIT - DevForum Project
import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuestionCard } from "@/components/questions/question-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getQuestions } from "@/lib/actions/question.actions";
import { questionFilterSchema } from "@/lib/validators/question.schema";

interface QuestionsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
  const params = await searchParams;
  const filters = questionFilterSchema.safeParse(params);
  
  const { questions, pagination } = await getQuestions(
    filters.success ? filters.data : undefined
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Questions</h1>
          <p className="text-muted-foreground">
            {pagination.total} questions • {pagination.pages} pages
          </p>
        </div>
        <Button asChild>
          <Link href="/questions/new">Ask Question</Link>
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="pl-9"
            defaultValue={filters.success ? filters.data.search : ""}
            name="search"
          />
        </div>
        <select
          name="sortBy"
          defaultValue={filters.success ? filters.data.sortBy : "newest"}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="votes">Most Votes</option>
          <option value="answers">Most Answers</option>
        </select>
      </div>

      {/* Questions List */}
      <Suspense fallback={<QuestionsSkeleton />}>
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">No questions found</p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/questions/new">Be the first to ask one</Link>
            </Button>
          </div>
        )}
      </Suspense>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {pagination.hasPrev && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`?page=${pagination.page - 1}`}>Previous</Link>
            </Button>
          )}
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </span>
          {pagination.hasNext && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`?page=${pagination.page + 1}`}>Next</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex gap-4">
            <div className="min-w-[50px] space-y-2">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}