import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

export default function HelpPage() {
  return (
    <>
      <AppHeader />
      <section
        className="max-w-3xl mx-auto my-12 md:my-20 px-4 md:px-8 py-10 md:py-16 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-labelledby="help-title"
        tabIndex={-1}
      >
        <header className="mb-8 text-center">
          <h1
            id="help-title"
            className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 tracking-tight"
          >
            Help Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <em>Last updated: January 11, 2026</em>
          </p>
        </header>
        <div className="space-y-8 text-base leading-relaxed text-slate-800 dark:text-slate-200">
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Getting Started</h2>
            <p>
              Welcome to the Pilot Handbook Help Center. Here you will find answers to common questions and troubleshooting tips.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Frequently Asked Questions</h2>
            <ul className="list-disc list-inside ml-2 mt-2">
              <li>How do I create an account? <span className="text-slate-500">(Feature coming soon)</span></li>
              <li>How do I log a flight? <span className="text-slate-500">(Feature coming soon)</span></li>
              <li>How do I reset my password? <span className="text-slate-500">(Feature coming soon)</span></li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Support</h2>
            <p>
              If you need further assistance, please contact our support team at <span className="text-blue-700 dark:text-blue-300">support@pilothandbook.com</span>.
            </p>
          </section>
        </div>
      </section>
      <AppFooter />
    </>
  );
}
