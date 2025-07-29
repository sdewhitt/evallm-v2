import React from "react";
import './globals.css';
import LoginForm from "@/components/LoginForm";

export default function Home() {

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to Evallm!</h1>
      <LoginForm />
    </div>
  );
}

