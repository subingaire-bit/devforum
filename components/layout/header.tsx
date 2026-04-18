// Licensed under MIT - DevForum Project
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import {
  LogIn,
  LogOut,
  Menu,
  Plus,
  User,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">DevForum</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/questions"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Questions
            </Link>
            <Link
              href="/tags"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Tags
            </Link>
            <Link
              href="/users"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Users
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Button asChild variant="ghost" size="icon" className="md:hidden">
                <Link href="/questions/new" aria-label="Ask question">
                  <Plus className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild className="hidden md:inline-flex">
                <Link href="/questions/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Ask Question
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/" })}
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
              <Button asChild variant="ghost" size="icon">
                <Link href="/profile" aria-label="Profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}