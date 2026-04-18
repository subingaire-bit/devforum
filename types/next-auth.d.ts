// types/next-auth.d.ts
// Licensed under MIT - DevForum Project

import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

// ✅ Augment next-auth module for Session & User
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    username?: string | null;
  }
}

// ✅ Augment next-auth/jwt module for JWT
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    username?: string | null;
  }
}