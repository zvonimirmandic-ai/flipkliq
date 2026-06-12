import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-brand-bg">
      <Header />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
