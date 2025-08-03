import React from "react";
import './globals.css';
import LoginForm from "@/components/LoginForm";
import Image from "next/image";

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-gray-950 to-black opacity-50"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
          <Image
            src="/EvallmLogo.png"
            alt="Evallm Logo"
            width={120}
            height={120}
            className=""
          />
        </div>
        
        {/* Welcome text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-blue-400 bg-clip-text text-transparent mb-3">
            Welcome to Evallm
          </h1>
          <p className="text-gray-400 text-lg">
            Your AI evaluation platform
          </p>
        </div>
        
        {/* Login form */}
        <LoginForm />
        
        {/* Footer text */}
        <p className="text-gray-500 text-sm mt-8 text-center">
          Sign in to start evaluating AI models and experiments
        </p>
      </div>
    </div>
  );
}

