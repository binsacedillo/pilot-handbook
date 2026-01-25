import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

export default function ContactPage() {
  return (
    <>
      <AppHeader />
      <section
        className="max-w-3xl mx-auto my-12 md:my-20 px-4 md:px-8 py-10 md:py-16 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-labelledby="contact-title"
        tabIndex={-1}
      >
        <header className="mb-8 text-center">
          <h1
            id="contact-title"
            className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 tracking-tight"
          >
            Contact Us
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <em>Last updated: January 11, 2026</em>
          </p>
        </header>
        <div className="space-y-8 text-base leading-relaxed text-slate-800 dark:text-slate-200">
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Get in Touch</h2>
            <p>
              Have questions, feedback, or need support? Reach out to the Pilot Handbook team using the contact details below.
            </p>
            <ul className="list-disc list-inside ml-2 mt-2">
              <li>Email: <span className="text-blue-700 dark:text-blue-300">support@pilothandbook.com</span></li>
              <li>For urgent matters, please indicate &quot;URGENT&quot; in your subject line.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-2">Contact Form</h2>
            <p>
              A contact form will be available here soon. In the meantime, please use the email above for all inquiries.
            </p>
          </section>
        </div>
      </section>
      <AppFooter />
    </>
  );
}
