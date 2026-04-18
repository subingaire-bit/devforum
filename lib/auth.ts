// Licensed under MIT - Limbel Project
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import GitLab from "next-auth/providers/gitlab";
import { prisma } from "./prisma";
import { env } from "./env";

// ✅ Step 1: Define config (your existing code, with minor fixes)
export const authConfig = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    ...(env.ENABLE_OAUTH === "true" && env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET
      ? [GitHub({ 
          clientId: env.AUTH_GITHUB_ID, 
          clientSecret: env.AUTH_GITHUB_SECRET 
        })]
      : []),
    ...(env.ENABLE_OAUTH === "true" && env.AUTH_GITLAB_ID && env.AUTH_GITLAB_SECRET
      ? [GitLab({ 
          clientId: env.AUTH_GITLAB_ID, 
          clientSecret: env.AUTH_GITLAB_SECRET 
        })]
      : []),
    // Credentials provider enabled via env flag - implement in Phase 2
  ],
  
  pages: {
    signIn: "/auth/login",
    error: "/login",
  },
  
  callbacks: {
    // ✅ Fixed: session callback signature for database strategy
    async session({ session, user }) {
      if (user?.id) {
        session.user.id = user.id;
      }
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  
  session: { strategy: "database" },
  trustHost: true,
} satisfies NextAuthConfig;

// ✅ Step 2: Initialize NextAuth and export the instance
export const {
  handlers: { GET, POST },  // For route handler re-export
  auth,                     // ✅ This is what layout.tsx imports
  signIn,
  signOut,
} = NextAuth(authConfig);