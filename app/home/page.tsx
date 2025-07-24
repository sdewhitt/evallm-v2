import React from 'react'
import Image from "next/image";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Logout from '@/components/Logout';


import MarkdownRenderer from "@/components/MarkdownRenderer";

interface Experiment {
  prompt: string;
  expected: string;
  responsesAndEvaluations: {
    [model: string]: {
      response: string;
      evaluation: {
        responseTime: number;
        exactMatch: boolean;
        similarity: number;
        bleu: number;
        rouge: number[];
        perplexity: number;
      };
    };
  };
}

const models = ['llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
const defaultStatistics: { [key: string]: number | string} = {
  numResponses: 0,
  avgSimilarity: 0,
  avgBleu: 0,
  avgRouge: 0,
}
const defaultModelStatistics: { [key: string]: { [key: string]: number | string} } = models.reduce((acc: { [key: string]: { [key: string]: number | string} }, model) => {
  acc[model] = { ...defaultStatistics };
  return acc;
}, {});


export default async function Home() {
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
