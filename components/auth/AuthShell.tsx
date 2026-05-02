import { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#f5f2f0] flex flex-col selection:bg-[#f1ccff] selection:text-[#000000]">
      <main className="flex-1 flex items-center justify-center px-4 py-[140px]">
        <section className="w-full max-w-[420px] bg-[#ffffff] rounded-[24px] p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-serif text-[32px] leading-[1.25] text-[#000000] font-normal -tracking-[0.8px] mb-2">
              {title}
            </h1>
            <p className="text-[16px] leading-[1.4] -tracking-[0.16px] text-[#333333]">
              {description}
            </p>
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}
