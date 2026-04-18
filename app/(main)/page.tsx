// Licensed under MIT - DevForum Project
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <section className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        Welcome to{" "}
        <span className="text-primary">DevForum</span>
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
        The open-source Q&A community built by developers, for developers.
        Ask questions, share knowledge, and grow together.
      </p>
      
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {session ? (
          <>
            <Button asChild size="lg">
              <Link href="/questions/new">Ask a Question</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/questions">Browse Questions</Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild size="lg">
              <Link href="/auth/login">Sign In to Get Started</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/questions">Explore Public Questions</Link>
            </Button>
          </>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-4xl">
        {[
          { title: "Ask", desc: "Get unstuck with help from the community" },
          { title: "Answer", desc: "Share your expertise and help others" },
          { title: "Connect", desc: "Follow developers and build your network" },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-lg border bg-card p-6 text-left shadow-sm"
          >
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}