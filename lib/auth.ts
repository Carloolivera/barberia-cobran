import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";

const loginSchema = z.object({
  password: z.string().min(4),
});

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

        const valid = await bcrypt.compare(password, adminPassword);
        if (!valid) return null;

        // Admin user único (el peluquero)
        return { id: "admin", name: "Cobrán", email: "admin@cobran.com" };
      },
    }),
  ],
});
