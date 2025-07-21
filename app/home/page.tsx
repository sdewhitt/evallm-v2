import React from 'react'
import Image from "next/image";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Logout from '@/components/Logout';

const Home = async () => {

    const session = await auth();

    if (!session?.user) redirect("/");
    

  return (
    <div>
        <h1 className="text-3xl font-bold mb-6">Welcome, {session?.user?.name}!</h1>
        <p className="mb-4">You are logged in as {session?.user?.email}.</p>
        <p className="text-gray-500">This is your home page.</p>
        <Image
            src={session?.user?.image || "/default-avatar.png"}
            alt={session?.user?.name || "User Avatar"}
            width={100}
            height={100}
            className="rounded-full mt-4"/>

        <Logout />
    </div>
  )
}

export default Home