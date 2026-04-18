// Licensed under MIT - DevForum Project
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  name: string;
  slug: string;
  variant?: "default" | "outline";
  className?: string;
}

export function TagBadge({ name, slug, variant = "default", className }: TagBadgeProps) {
  return (
    <Badge
      asChild
      variant={variant}
      className={cn("font-normal hover:opacity-80 transition-opacity", className)}
    >
      <Link href={`/tags/${slug}`}>
        {name}
      </Link>
    </Badge>
  );
}