import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ profile }: { profile: any }) {
      // restrict to company domain
      // return profile?.hd === "satriwit3.ac.th";
      return true
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
