import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
