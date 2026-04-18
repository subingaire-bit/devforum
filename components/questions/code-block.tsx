// Licensed under MIT - DevForum Project
"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export function CodeBlock({ code, language, filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy code:", err);
    }
  };

  return (
    <div className={cn("group relative rounded-lg border bg-muted/50 overflow-hidden", className)}>
      {(filename || language) && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted border-b text-xs">
          <div className="flex items-center gap-2">
            {filename && <span className="font-mono">{filename}</span>}
            {language && (
              <span className="text-muted-foreground">
                {language}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-muted-foreground hover:text-foreground"
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}