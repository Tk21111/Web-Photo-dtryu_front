import NextAuth from "next-auth";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import User from "@/app/model/User";
import { connectToDatabase } from "@/app/lib/mongodb";
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
  async signIn({ profile }) {
    await connectToDatabase();

    const user = await User.findOne({ email: profile?.email });

    if (user || profile?.hd === "mycompany.com") {
      return true;
    }
    return false;
  },
  async jwt({ token, user }) {
    if (user) {
      // fetch user again if needed
      const dbUser = await User.findOne({ email: user.email });
      if (dbUser?.tagId) token.tag = dbUser.tagId;
    }
    return token;
  },
  async session({ session, token }) {
    if (token.tag) session.user.tag = token.tag;
    return session;
  },
}

};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
