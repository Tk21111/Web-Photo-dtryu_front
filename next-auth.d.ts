import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      tag?: string |null ; 
    };
  }

  interface JWT {
    tag?: string; 
  }
   interface User {
    tag?: string |null | undefined; 
  }
}
