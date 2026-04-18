// Licensed under MIT - DevForum Project
import { authConfig } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authConfig);

export { handler as GET, handler as POST };

// Re-export auth helper for server components
export const auth = handler.auth;