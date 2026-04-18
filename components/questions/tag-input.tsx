// Licensed under MIT - DevForum Project
"use client";

// At the top of the component:
const [input, setInput] = useState<string>("");  // ✅ Explicit <string> generic
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export function TagInput({ 
  value, 
  onChange, 
  placeholder = "Add tags...", 
  maxTags = 5,
  className 
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch tag suggestions (debounced)
  useEffect(() => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tags?q=${encodeURIComponent(input.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.tags.filter((t: string) => !value.includes(t)));
        }
      } catch (err) {
        console.warn("Failed to fetch tag suggestions:", err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input, value]);

  const addTag = (tag: string) => {
    const normalized = tag.toLowerCase().trim();
    if (normalized && !value.includes(normalized) && value.length < maxTags) {
      onChange([...value, normalized]);
      setInput("");
      setSuggestions([]);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) {
        addTag(input);
      }
    } else if (input.trim()) {
  addTag(input as string);  // ✅ Tell TypeScript it's definitely a string
}
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 p-2 border border-input rounded-md bg-background min-h-[40px]">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-destructive focus:outline-none"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length >= maxTags ? "Max tags reached" : placeholder}
          disabled={value.length >= maxTags}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground disabled:opacity-50"
          aria-label="Add tag"
        />
      </div>
      
      {suggestions.length > 0 && (
        <ul className="border border-input rounded-md bg-background shadow-lg max-h-48 overflow-auto z-10">
          {suggestions.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                onClick={() => addTag(tag)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent focus:bg-accent focus:outline-none"
              >
                {tag}
              </button>
            </li>
          ))}
        </ul>
      )}
      
      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add • Max {maxTags} tags
      </p>
    </div>
  );
}