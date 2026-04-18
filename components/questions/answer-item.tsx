// Licensed under MIT - DevForum Project
"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";  // ✅ Ensure this supports the variant you use
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownRenderer } from "./markdown-renderer";
import { VoteButtons } from "./vote-buttons";
import { formatRelativeDate, cn } from "@/lib/utils";  // ✅ Import cn from utils (remove local definition)
import { AnswerWithRelations } from "@/types/question.types";
import { acceptAnswer } from "@/lib/actions/answer.actions";

interface AnswerItemProps {
  answer: AnswerWithRelations;
  isQuestionAuthor: boolean;
  onAccept?: () => void;
}

export function AnswerItem({ answer, isQuestionAuthor, onAccept }: AnswerItemProps) {
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    if (accepting) return;
    setAccepting(true);
    try {
      await acceptAnswer({ answerId: answer.id, questionId: answer.questionId });
      onAccept?.();
    } catch (err) {
      console.error("Failed to accept answer:", err);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <article className={cn(
      "border rounded-lg p-4",
      answer.accepted && "border-green-500/50 bg-green-500/5 dark:bg-green-900/10"
    )}>
      <div className="flex gap-4">
        {/* Vote + Accept */}
        <div className="flex flex-col items-center gap-2 min-w-[50px]">
          <VoteButtons
            targetId={answer.id}
            targetType="answer"
            initialVoteCount={answer.voteCount}
            userVote={null}
          />
          {answer.accepted && (
            // ✅ Fixed: Use "default" variant + custom classes instead of non-existent "success"
            <Badge 
              variant="default" 
              className="mt-1 bg-green-500 hover:bg-green-600 text-white border-transparent"
            >
              <Check className="h-3 w-3 mr-1" />
              Accepted
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MarkdownRenderer content={answer.content} />
          </div>

          {/* Meta */}
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={answer.author.image ?? undefined} />
                <AvatarFallback>{answer.author.name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
              </Avatar>
              <span>{answer.author.username ?? answer.author.name ?? "Anonymous"}</span>
              <time dateTime={answer.createdAt.toISOString()}>
                • {formatRelativeDate(answer.createdAt)}
              </time>
            </div>
            
            {isQuestionAuthor && !answer.accepted && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAccept}
                disabled={accepting}
                className="h-7 text-xs"
              >
                {accepting ? "Accepting..." : "Accept Answer"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ✅ REMOVED: Local cn() definition - now imported from @/lib/utils