import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

export default function ContactPage() {
  return (
    <>
      <AppHeader />
      <section className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-300 mb-6">Contact Us</h1>
        <p className="text-lg text-slate-700 dark:text-slate-200 mb-4">
          Have questions or need support? Reach out to the Pilot Handbook team.
        </p>
        <p className="text-base text-slate-600 dark:text-slate-400">
          This is placeholder content. For real inquiries, please use the contact form or email provided in the official documentation.
        </p>
      </section>
      <AppFooter />
    </>
  );
}
