import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { headers } from "next/headers";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  password: z.string().min(4),
});

async function checkPassword(input: string, hash: string): Promise<boolean> {
  return compare(input, hash);
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

        const headersList = await headers();
        const ip =
          headersList.get("x-forwarded-for")?.split(",").pop()?.trim() ??
          headersList.get("x-real-ip") ??
          "unknown";

        const { allowed } = checkRateLimit(ip);
        if (!allowed) return null;

        const { password } = parsed.data;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) return null;

        const valid = await checkPassword(password, adminPassword);
        if (!valid) return null;

        resetRateLimit(ip);
        return { id: "admin", name: "Cobrán", email: "admin@cobran.com" };
      },
    }),
  ],
});
