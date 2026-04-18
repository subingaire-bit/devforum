// Licensed under MIT - DevForum Project
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkdownRenderer } from "./markdown-renderer";
import { answerCreateSchema, type AnswerCreateInput } from "@/lib/validators/answer.schema";
import { createAnswer } from "@/lib/actions/answer.actions";
import { AlertCircle, Loader2, Eye, Edit3 } from "lucide-react";

interface AnswerFormProps {
  questionId: string;
  onAnswerPosted?: () => void;
}

export function AnswerForm({ questionId, onAnswerPosted }: AnswerFormProps) {
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<AnswerCreateInput>({
    resolver: zodResolver(answerCreateSchema),
    defaultValues: { questionId, content: "" },
  });

  const content = watch("content");

  // ✅ Fixed: Proper parameter typing
  const onSubmit = async (data: { content: string }) => {
    setError(null);
    
    startTransition(async () => {
      try {
        // ✅ Fixed: Pass both questionId and content
        const result = await createAnswer({ 
          questionId, 
          content: data.content 
        });
        
        if (result.success) {
          reset();
          onAnswerPosted?.();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to post answer");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="answer">Your Answer</Label>
        <div className="flex justify-end gap-2 mb-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPreview(!preview)}
            className="text-xs"
          >
            {preview ? <Edit3 className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
            {preview ? "Edit" : "Preview"}
          </Button>
        </div>
        
        {preview ? (
          <div className="min-h-[200px] p-4 border rounded-md bg-muted/30 prose prose-sm dark:prose-invert max-w-none">
            <MarkdownRenderer content={content || "*Nothing to preview*"} />
          </div>
        ) : (
          <Textarea
            id="answer"
            placeholder="Write your answer here... Use Markdown for formatting."
            className="min-h-[200px] font-mono text-sm"
            {...register("content")}
            disabled={isPending}
            aria-invalid={!!errors.content}
          />
        )}
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message as string}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            "Post Answer"
          )}
        </Button>
      </div>
    </form>
  );
}