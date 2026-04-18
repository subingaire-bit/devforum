// Licensed under MIT - Limbel Project
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create demo users
  const passwordHash = await hash("password123", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@devforum.local" },
    update: {},
    create: {
      email: "demo@devforum.local",
      name: "Demo Developer",
      username: "demodev",
      bio: "Building the future, one commit at a time. 🚀",
      website: "https://example.com",
      location: "Remote",
      emailVerified: new Date(),
    },
  });

  // Create sample tags
  const tags = [
    { name: "typescript", slug: "typescript" },
    { name: "nextjs", slug: "nextjs" },
    { name: "react", slug: "react" },
    { name: "prisma", slug: "prisma" },
    { name: "authentication", slug: "authentication" },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  console.log("✅ Seed completed:");
  console.log(`   - User: ${demoUser.email}`);
  console.log(`   - Tags: ${tags.length} created`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });