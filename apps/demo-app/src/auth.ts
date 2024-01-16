import NextAuth from "next-auth";

import GoogleProvider from "next-auth/providers/google";

import { XataAdapter } from "@/lib/xata-auth-adapter";

export const nextAuth = NextAuth({
  adapter: XataAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
} = nextAuth;

export const auth = () => nextAuth.auth();
