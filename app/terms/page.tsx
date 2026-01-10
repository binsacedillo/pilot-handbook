import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

export default function TermsPage() {
  return (
    <>
      <AppHeader />
      <section className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-300 mb-6">Terms of Service</h1>
        <p className="text-lg text-slate-700 dark:text-slate-200 mb-4">
          These Terms of Service govern your use of Pilot Handbook. By accessing or using our platform, you agree to these terms. Please review them carefully.
        </p>
        <p className="text-base text-slate-600 dark:text-slate-400">
          This is placeholder content. Please consult the official documentation for the full legal terms and conditions.
        </p>
      </section>
      <AppFooter />
    </>
  );
}