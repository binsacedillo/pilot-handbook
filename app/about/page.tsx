import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

export default function AboutPage() {
  return (
    <>
      <AppHeader />
      <section className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-300 mb-6">About Pilot Handbook</h1>
        <p className="text-lg text-slate-700 dark:text-slate-200 mb-4">
          Pilot Handbook is your trusted digital companion for flight logging, analytics, and pilot record management. Our mission is to empower pilots with modern, secure, and easy-to-use tools.
        </p>
        <p className="text-base text-slate-600 dark:text-slate-400">
          This project is built with a focus on privacy, reliability, and a beautiful user experience. For more information, contact our team or explore the rest of the site.
        </p>
      </section>
      <AppFooter />
    </>
  );
}
