import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

export default function HelpPage() {
  return (
    <>
      <AppHeader />
      <section className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-300 mb-6">Help Center</h1>
        <p className="text-lg text-slate-700 dark:text-slate-200 mb-4">
          Need assistance? Find answers to common questions and troubleshooting tips for Pilot Handbook.
        </p>
        <p className="text-base text-slate-600 dark:text-slate-400">
          This is placeholder content. Please check back soon for more detailed help resources.
        </p>
      </section>
      <AppFooter />
    </>
  );
}
