import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      tag?: string; // ✅ add your custom field here
    };
  }

  interface JWT {
    tag?: string; // if you store it in JWT
  }
}
