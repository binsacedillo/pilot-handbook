import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

export default function TermsPage() {
  return (
    <>
      <AppHeader />
      <section
        className="max-w-3xl mx-auto my-12 md:my-20 px-4 md:px-8 py-10 md:py-16 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-labelledby="terms-title"
        tabIndex={-1}
      >
        <header className="mb-8 text-center">
          <h1
            id="terms-title"
            className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 tracking-tight"
          >
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <em>Last updated: January 11, 2026</em>
          </p>
        </header>
        <div className="space-y-8 text-base leading-relaxed text-slate-800 dark:text-slate-200">
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Effective Date</h2>
            <p>January 11, 2026</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Project Status</h2>
            <p>Pilot Handbook is currently under development. The following terms are provided for transparency and may be updated prior to public launch.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using Pilot Handbook, you agree to be bound by these Terms of Service. If you do not agree, you may not use the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">2. Use of the Platform</h2>
            <p>You may use Pilot Handbook only for lawful purposes and in accordance with these terms. The platform is provided &quot;as is&quot; during the development phase and may be subject to change or downtime.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">3. User Accounts</h2>
            <p>If you create an account, you are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">4. Intellectual Property</h2>
            <p>All content, trademarks, and intellectual property on Pilot Handbook remain the property of their respective owners. You may not copy, modify, or distribute any part of the platform without permission.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">5. Disclaimer &amp; Limitation of Liability</h2>
            <p>Pilot Handbook is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no warranties regarding the accuracy, reliability, or availability of the platform. To the fullest extent permitted by law, we disclaim all liability for any damages arising from your use of the platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">6. Changes to Terms</h2>
            <p>We reserve the right to update these Terms of Service at any time. Changes will be posted on this page with an updated effective date.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">7. Contact</h2>
            <p>For questions about these Terms of Service, please contact the project team. Official contact details will be provided upon public release.</p>
          </section>
        </div>
      </section>
      <AppFooter />
    </>
  );
}