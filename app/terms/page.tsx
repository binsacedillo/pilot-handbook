import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

export default function TermsPage() {
  return (
    <>
      <AppHeader />
      <section className="max-w-4xl mx-auto py-20 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-300 mb-6 text-center">Terms of Service</h1>
        <div className="space-y-6 text-base text-slate-700 dark:text-slate-200">
          <p>
            <strong>Effective Date:</strong> January 11, 2026
          </p>
          <p>
            <strong>Project Status:</strong> Pilot Handbook is currently under development. The following terms are provided for transparency and may be updated prior to public launch.
          </p>
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mt-8 mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Pilot Handbook, you agree to be bound by these Terms of Service. If you do not agree, you may not use the platform.
          </p>
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mt-8 mb-2">2. Use of the Platform</h2>
          <p>
            You may use Pilot Handbook only for lawful purposes and in accordance with these terms. The platform is provided &quot;as is&quot; during the development phase and may be subject to change or downtime.
          </p>
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mt-8 mb-2">3. User Accounts</h2>
          <p>
            If you create an account, you are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.
          </p>
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mt-8 mb-2">4. Intellectual Property</h2>
          <p>
            All content, trademarks, and intellectual property on Pilot Handbook remain the property of their respective owners. You may not copy, modify, or distribute any part of the platform without permission.
          </p>
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mt-8 mb-2">5. Disclaimer & Limitation of Liability</h2>
          <p>
            Pilot Handbook is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no warranties regarding the accuracy, reliability, or availability of the platform. To the fullest extent permitted by law, we disclaim all liability for any damages arising from your use of the platform.
          </p>
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mt-8 mb-2">6. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms of Service at any time. Changes will be posted on this page with an updated effective date.
          </p>
          <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mt-8 mb-2">7. Contact</h2>
          <p>
            For questions about these Terms of Service, please contact the project team. Official contact details will be provided upon public release.
          </p>
        </div>
      </section>
      <AppFooter />
    </>
  );
}