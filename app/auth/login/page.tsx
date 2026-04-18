// Licensed under MIT - DevForum Project
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Gitlab } from "lucide-react";
import { signIn } from "next-auth/react";  // ✅ Correct for NextAuth v5
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";  // ✅ For manual redirect if needed

export default function LoginPage() {
  const router = useRouter();  // ✅ Add router for fallback redirect
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: "github" | "gitlab") => {
    setIsLoading(true);
    setError(null);
    
    try {
      // ✅ NextAuth v5: signIn returns Promise<{error?: string, status?: number, url?: string}>
      const result = await signIn(provider, { 
        callbackUrl: "/",  // Where to redirect after success
        redirect: false,   // ✅ Handle redirect manually for better UX
      });
      
      if (result?.error) {
        setError(result.error === "OAuthSignin" ? "OAuth callback failed" : "Sign in failed");
      } else if (result?.url) {
        // ✅ Manual redirect if redirect: false
        router.push(result.url);
      }
    } catch (err) {
      console.error("OAuth sign-in failed:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // ⚠️ Credentials provider not enabled in Phase 1 (see lib/auth.ts)
      // This will fail until you add Credentials provider to authConfig
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
        redirect: false,
      });
      
      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      console.error("Credentials sign-in failed:", err);
      setError("Credentials auth not configured yet (Phase 2)");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to continue to DevForum
        </p>
      </div>

      {/* ✅ Show error message if any */}
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* ✅ Disable credentials form until Phase 2 (optional) */}
      <form onSubmit={handleCredentialsSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          // ✅ Optional: disable until Credentials provider is enabled
          // disabled={isLoading || env.ENABLE_EMAIL_AUTH !== "true"}
        >
          {isLoading ? "Signing in..." : "Sign in with Email"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn("github")}
          disabled={isLoading}
          className="w-full"
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuthSignIn("gitlab")}
          disabled={isLoading}
          className="w-full"
        >
          <Gitlab className="mr-2 h-4 w-4" />
          GitLab
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}