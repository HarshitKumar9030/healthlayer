"use client";

import { SignIn } from "@clerk/nextjs";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { AuthShell } from "@/components/auth/AuthShell";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#f5f2f0] flex flex-col selection:bg-[#f1ccff] selection:text-[#000000]">
      <Nav />
      <main className="flex-1 pt-35 pb-20 px-4 flex items-center justify-center">
        <AuthShell title="Welcome back" description="Sign in to your HealthLayer account">
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#f1ccff",
                colorBackground: "#ffffff",
                colorText: "#333333",
                colorTextOnPrimaryBackground: "#000000",
                borderRadius: "10px",
                fontFamily: "inherit",
              },
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent p-0 m-0",
                formButtonPrimary:
                  "bg-[#f1ccff] hover:bg-[#e6b5f5] text-[#000000] h-[44px] text-[16px] font-medium transition-colors shadow-none border-0 rounded-[10px]",
                formFieldInput:
                  "border border-[#d6d6d6] rounded-[10px] h-[44px] text-[16px] bg-[#ffffff] text-[#333333] focus:border-[#000000] focus:ring-0",
                formFieldLabel: "text-[#000000] text-[14px] font-medium",
                socialButtonsBlockButton:
                  "border border-[#d6d6d6] hover:bg-[#f5f2f0] transition-colors rounded-[10px] h-[44px] shadow-none",
                socialButtonsBlockButtonText: "font-medium text-[14px] text-[#000000]",
                dividerLine: "bg-[#d6d6d6]",
                dividerText: "text-[#7b7b7b] text-[13px]",
                footerActionLink: "text-[#000000] font-semibold hover:text-[#7b7b7b]",
                footerActionText: "text-[#7b7b7b]",
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </AuthShell>
      </main>
      <Footer />
    </div>
  );
}
