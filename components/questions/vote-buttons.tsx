// Licensed under MIT - DevForum Project
"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { castVote } from "@/lib/actions/vote.actions";

interface VoteButtonsProps {
  targetId: string;
  targetType: "question" | "answer";
  initialVoteCount: number;
  userVote: number | null;
  className?: string;
  onVoteChange?: (newCount: number) => void;
}

export function VoteButtons({ 
  targetId, 
  targetType, 
  initialVoteCount, 
  userVote,
  className,
  onVoteChange 
}: VoteButtonsProps) {
  const [voteCount, setVoteCount] = useState(initialVoteCount);
  const [currentVote, setCurrentVote] = useState(userVote);
  const [loading, setLoading] = useState(false);

  const handleVote = async (value: 1 | -1) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await castVote({ targetId, targetType, value });
      if (result.success) {
        setVoteCount(result.voteCount);
        const newVote = currentVote === value ? null : value;
        setCurrentVote(newVote);
        onVoteChange?.(result.voteCount);
      }
    } catch (error) {
      console.error("Voting failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 p-0",
          currentVote === 1 && "text-primary bg-primary/10 hover:bg-primary/20"
        )}
        onClick={() => handleVote(1)}
        disabled={loading}
        aria-label="Upvote"
        aria-pressed={currentVote === 1}
      >
        <ArrowUp className={cn("h-5 w-5", currentVote === 1 && "fill-current")} />
      </Button>
      
      <span 
        className={cn(
          "text-sm font-medium min-w-[2ch] text-center",
          voteCount > 0 && "text-primary",
          voteCount < 0 && "text-destructive"
        )}
        aria-live="polite"
      >
        {voteCount}
      </span>
      
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 p-0",
          currentVote === -1 && "text-destructive bg-destructive/10 hover:bg-destructive/20"
        )}
        onClick={() => handleVote(-1)}
        disabled={loading}
        aria-label="Downvote"
        aria-pressed={currentVote === -1}
      >
        <ArrowDown className={cn("h-5 w-5", currentVote === -1 && "fill-current")} />
      </Button>
    </div>
  );
}