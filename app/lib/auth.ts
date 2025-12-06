import { NextAuthOptions, Account, Profile, User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import User from "@/app/model/User";
import { connectToDatabase } from "@/app/lib/mongodb";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn(params: {
      user: NextAuthUser;         // use NextAuthUser
      account: Account | null;
      profile?: Profile;
      email?: { verificationRequest?: boolean };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      credentials?: Record<string, any>;
    }) {
        const { profile } = params;

        await connectToDatabase();

        // Cast profile to GoogleProfile safely
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const googleProfile = profile as any; // or "as GoogleProfile" if sure
        const user = await User.findOne({ email: googleProfile?.email });

        // if (user || googleProfile?.hd === "mycompany.com") {
        if (user) {
            return true;
        }
        return false;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser?.tagId) token.tag = dbUser.tagId;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.tag) {
        session.user = session.user || {};
        session.user.tag = token.tag as string;
      }
      return session;
    },
  },
};

export {authOptions}