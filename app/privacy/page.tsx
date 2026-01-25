import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import Image from "next/image";

export default function PrivacyPage() {
  return (
    <>
      <AppHeader />
      <section
        className="max-w-3xl mx-auto my-12 md:my-20 px-4 md:px-8 py-10 md:py-16 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-labelledby="privacy-policy-title"
        tabIndex={-1}
      >
        <header className="mb-8 text-center">
          <h1
            id="privacy-policy-title"
            className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 tracking-tight"
          >
            Privacy Policy
          </h1>
          <div className="flex justify-center mb-2">
            <Image
              src="/NPC_Logo_1.png"
              alt="National Privacy Commission (NPC) Logo"
              width={160}
              height={48}
              className="h-12 w-auto rounded-md shadow-sm border border-slate-200 dark:border-slate-700 bg-white"
              priority
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <em>Last updated: January 11, 2026</em>
          </p>
        </header>
        <div className="space-y-8 text-base leading-relaxed text-slate-800 dark:text-slate-200">
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Introduction</h2>
            <p>
              Pilot Handbook (“we”, “us”, “our”) is a Personal Information Controller (PIC) registered and compliant with the National Privacy Commission (NPC) of the Philippines. We are committed to protecting your privacy and ensuring the security of your personal data in accordance with Republic Act No. 10173 (Data Privacy Act of 2012) and global best practices, including the General Data Protection Regulation (GDPR).
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Data Collected</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-blue-500 dark:text-blue-200 mb-1">Personal and Pilot Data</h3>
                <ul className="list-disc list-inside ml-2">
                  <li>Flight logs (dates, routes, durations, remarks)</li>
                  <li>Aircraft details (make, model, registration, status)</li>
                  <li>Pilot license numbers and expiry dates</li>
                  <li>User profile information (name, email, role)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-blue-500 dark:text-blue-200 mb-1">Technical and Authentication Data</h3>
                <ul className="list-disc list-inside ml-2">
                  <li>Authentication logs and metadata (via Clerk)</li>
                  <li>Device and browser information</li>
                  <li>IP address and usage analytics</li>
                </ul>
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Purpose of Data Processing</h2>
            <p>Your data is collected and processed for the following purposes:</p>
            <ul className="list-disc list-inside ml-2">
              <li>To provide and improve the Pilot Handbook SaaS platform</li>
              <li>To ensure secure authentication and account management</li>
              <li>To maintain accurate pilot records and analytics</li>
              <li>To comply with legal and regulatory requirements</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Rights of the Data Subject</h2>
            <p>As a data subject under Philippine law, you have the following rights:</p>
            <ol className="list-decimal list-inside ml-2 space-y-1">
              <li><span className="font-semibold">Right to be Informed:</span> You have the right to be notified and furnished with information before your personal data is processed.</li>
              <li><span className="font-semibold">Right to Access:</span> You have the right to access your personal data and obtain a copy of it.</li>
              <li><span className="font-semibold">Right to Object:</span> You may object to the processing of your personal data, especially for marketing, profiling, or automated processing.</li>
              <li><span className="font-semibold">Right to Erasure (Blocking):</span> You may request the deletion or blocking of your personal data under certain circumstances.</li>
              <li><span className="font-semibold">Right to Damages:</span> You have the right to be indemnified for damages sustained due to inaccurate, incomplete, outdated, false, unlawfully obtained, or unauthorized use of personal data.</li>
              <li><span className="font-semibold">Right to Data Portability:</span> You have the right to obtain and electronically move, copy, or transfer your data in a secure manner.</li>
              <li><span className="font-semibold">Right to File a Complaint:</span> You may file a complaint with the National Privacy Commission (NPC) for any violation of your data privacy rights.</li>
            </ol>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Third-Party Processors</h2>
            <p>We use trusted third-party service providers to deliver our services:</p>
            <ul className="list-disc list-inside ml-2">
              <li><span className="font-semibold">Vercel</span> (Hosting and deployment)</li>
              <li><span className="font-semibold">Clerk</span> (Authentication and user management)</li>
              <li><span className="font-semibold">Supabase/Postgres</span> (Database and data storage)</li>
            </ul>
            <p>All third-party processors are contractually obligated to comply with data privacy standards and safeguard your information.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Data Security</h2>
            <p>We implement industry-standard security measures to protect your data from unauthorized access, alteration, disclosure, or destruction.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Data Retention</h2>
            <p>Your personal data is retained only as long as necessary to fulfill the purposes stated above or as required by law.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Contact: Data Protection Officer (DPO)</h2>
            <p>This project is currently under development. A designated Data Protection Officer (DPO) and official contact details will be provided once the platform is publicly launched.</p>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 mt-2">
              <p className="font-medium">Data Protection Officer (DPO)</p>
              <p className="text-slate-500">To be announced upon public release</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-8">
              By using Pilot Handbook, you acknowledge that you have read and understood this Privacy Policy. We may update this policy from time to time; any changes will be posted on this page.
            </p>
          </section>
        </div>
      </section>
      <AppFooter />
    </>
  );
}
