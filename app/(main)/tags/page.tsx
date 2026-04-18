// Licensed under MIT - DevForum Project
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    include: {
      _count: { select: { questions: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tags</h1>
        <p className="text-muted-foreground mt-2">
          Browse questions by topic
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag.id} asChild variant="outline" className="text-sm py-1.5 px-3">
            <Link href={`/tags/${tag.slug}`} className="flex items-center gap-2">
              {tag.name}
              <span className="text-muted-foreground">
                × {tag._count.questions}
              </span>
            </Link>
          </Badge>
        ))}
      </div>

      {tags.length === 0 && (
        <p className="text-muted-foreground text-center py-12">
          No tags yet. Be the first to ask a question with a tag!
        </p>
      )}
    </div>
  );
}