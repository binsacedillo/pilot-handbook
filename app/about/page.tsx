import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

export default function AboutPage() {
  return (
    <>
      <AppHeader />
      <section
        className="max-w-3xl mx-auto my-12 md:my-20 px-4 md:px-8 py-10 md:py-16 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-labelledby="about-title"
        tabIndex={-1}
      >
        <header className="mb-8 text-center">
          <h1
            id="about-title"
            className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 tracking-tight"
          >
            About Pilot Handbook
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <em>Last updated: January 11, 2026</em>
          </p>
        </header>
        <div className="space-y-8 text-base leading-relaxed text-slate-800 dark:text-slate-200">
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Our Mission</h2>
            <p>
              Pilot Handbook is your trusted digital companion for flight logging, analytics, and pilot record management. Our mission is to empower pilots with modern, secure, and easy-to-use tools.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Core Values</h2>
            <ul className="list-disc list-inside ml-2">
              <li>Privacy and data protection by design</li>
              <li>Reliability and accuracy in record keeping</li>
              <li>Modern, user-friendly experience</li>
              <li>Continuous improvement and transparency</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Project Status</h2>
            <p>
              This project is currently under development. Features and content may change as we work toward a public release. For more information, contact our team or explore the rest of the site.
            </p>
          </section>
        </div>
      </section>
      <AppFooter />
    </>
  );
}
