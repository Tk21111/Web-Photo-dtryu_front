"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function GoogleButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        <p>Welcome, {session.user?.email}</p>
        <button
          onClick={() => signOut()}
          className="bg-gray-200 px-4 py-2 rounded flex items-center gap-2"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full content-center justify-items-center">
        <div className="flex flex-col bg-black w-[50%] h-fit items-center justify-center rounded-2xl p-3">
          <p className="text-white text-center font-bold mb-3.5">{"@satriwit3 or registered"}</p>
          <button
          onClick={() => signIn("google")}
          className="bg-white border w-full border-gray-300 text-gray-700 px-4 py-2 rounded flex items-center gap-2 shadow-2xl shadow-black hover:bg-gray-200 hover:scale-101 transition-all duration-200"
          >
          <img
              src="/google.png"
              alt="Google"
              className="w-5 h-5"
          />
          Google
          </button>
        </div>
    </div>
  );
}
