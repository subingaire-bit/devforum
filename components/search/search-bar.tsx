// Licensed under MIT - DevForum Project
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search questions..."
        className="pl-9 pr-12"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search questions"
      />
      <Button 
        type="submit" 
        variant="ghost" 
        size="sm"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-3"
        disabled={!query.trim()}
      >
        Search
      </Button>
    </form>
  );
}