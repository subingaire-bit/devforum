// Licensed under MIT - DevForum Project
import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";
import { TagBadge } from "./tag-badge";
import { QuestionWithRelations } from "@/types/question.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface QuestionCardProps {
  question: QuestionWithRelations;
  showExcerpt?: boolean;
}

export function QuestionCard({ question, showExcerpt = true }: QuestionCardProps) {
  const excerpt = question.content.slice(0, 200).replace(/\n/g, " ");
  
  return (
    <article className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
      <div className="flex gap-4">
        {/* Vote count sidebar */}
        <div className="flex flex-col items-center justify-start pt-1 min-w-[50px]">
          <span className={cn(
            "text-lg font-bold",
            question.voteCount > 0 && "text-primary",
            question.voteCount < 0 && "text-destructive"
          )}>
            {question.voteCount}
          </span>
          <span className="text-xs text-muted-foreground">votes</span>
        </div>
        
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold leading-tight">
            <Link 
              href={`/questions/${question.slug}`}
              className="hover:text-primary transition-colors line-clamp-2"
            >
              {question.title}
            </Link>
          </h3>
          
          {showExcerpt && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {excerpt}{question.content.length > 200 ? "..." : ""}
            </p>
          )}
          
          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            {question.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} name={tag.name} slug={tag.slug} variant="outline" />
            ))}
            {question.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{question.tags.length - 3} more
              </span>
            )}
          </div>
          
          {/* Meta */}
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <Link 
              href={`/users/${question.author.username}`}
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={question.author.image || undefined} />
                <AvatarFallback>{question.author.name?.[0] || "?"}</AvatarFallback>
              </Avatar>
              <span>{question.author.username || question.author.name}</span>
            </Link>
            <span>•</span>
            <time dateTime={question.createdAt.toISOString()}>
              {formatRelativeDate(question.createdAt)}
            </time>
            <span>•</span>
            <span>{question._count.answers} answers</span>
            <span>•</span>
            <span>{question.views} views</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// Helper for cn since we use it above
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}