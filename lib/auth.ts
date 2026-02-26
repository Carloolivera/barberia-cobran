import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { timingSafeEqual } from "crypto";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";

const loginSchema = z.object({
  password: z.string().min(4),
});

// Timing-safe plain text comparison (avoids bcrypt $ issues in env vars)
function checkPassword(input: string, stored: string): boolean {
  try {
    const a = Buffer.from(input);
    const b = Buffer.from(stored);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { password } = parsed.data;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) return null;

        const valid = checkPassword(password, adminPassword);
        if (!valid) return null;

        return { id: "admin", name: "Cobrán", email: "admin@cobran.com" };
      },
    }),
  ],
});
