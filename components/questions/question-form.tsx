// Licensed under MIT - DevForum Project
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TagInput } from "./tag-input";
import { MarkdownRenderer } from "./markdown-renderer";
import { questionCreateSchema, type QuestionCreateInput } from "@/lib/validators/question.schema";
import { createQuestion } from "@/lib/actions/question.actions";
import { AlertCircle, Loader2, Eye, Edit3 } from "lucide-react";

interface QuestionFormProps {
  initialData?: Partial<QuestionCreateInput>;
  isEdit?: boolean;
}

export function QuestionForm({ initialData, isEdit = false }: QuestionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<QuestionCreateInput>({
    resolver: zodResolver(questionCreateSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      tags: initialData?.tags || [],
      published: initialData?.published ?? true,
    },
  });

  const content = watch("content");

  // ✅ Fixed: Correct TypeScript syntax for typed destructured parameter
  const onSubmit = async ({ content, title, tags, published }: QuestionCreateInput) => {
    setError(null);
    
    startTransition(async () => {
      try {
        // ✅ Fixed: Use destructured variables directly (not 'data.xxx')
        const result = await createQuestion({
          title,
          content,
          tags,
          published,
        });
        
        if (result.success) {
          router.push(`/questions/${result.question.slug}`);
          router.refresh();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create question");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g., How to implement authentication in Next.js 14?"
          {...register("title")}
          disabled={isPending}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-destructive">
            {errors.title.message as string}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Details</Label>
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
          <div className="min-h-[300px] p-4 border rounded-md bg-muted/30 prose prose-sm dark:prose-invert max-w-none">
            <MarkdownRenderer content={content || "*Nothing to preview*"} />
          </div>
        ) : (
          <Textarea
            id="content"
            placeholder="Describe your question in detail. Include code snippets, error messages, and what you've tried."
            className="min-h-[300px] font-mono text-sm"
            {...register("content")}
            disabled={isPending}
            aria-invalid={!!errors.content}
            aria-describedby={errors.content ? "content-error" : undefined}
          />
        )}
        {errors.content && (
          <p id="content-error" className="text-sm text-destructive">
            {errors.content.message as string}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Supports Markdown • Use triple backticks for code blocks
        </p>
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <TagInput
          value={watch("tags")}
          onChange={(tags) => setValue("tags", tags, { shouldValidate: true })}
          maxTags={5}
        />
        {errors.tags && (
          <p className="text-sm text-destructive">{errors.tags.message as string}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Updating..." : "Posting..."}
            </>
          ) : (
            isEdit ? "Update Question" : "Post Question"
          )}
        </Button>
      </div>
    </form>
  );
}