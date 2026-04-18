// Licensed under MIT - DevForum Project
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().min(1).max(50).optional(),
  limit: z.coerce.number().min(1).max(20).default(10),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { q, limit } = querySchema.parse({
      q: searchParams.get("q"),
      limit: searchParams.get("limit"),
    });

    const tags = await prisma.tag.findMany({
      where: q ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { slug: { contains: q, mode: "insensitive" } },
        ],
      } : undefined,
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
      take: limit,
    });

    return NextResponse.json({ tags: tags.map((t) => t.name) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }
    console.error("Tags API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}