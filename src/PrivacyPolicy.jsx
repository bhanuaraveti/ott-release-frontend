export default function PrivacyPolicy() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">Privacy Policy</h2>
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-lg shadow-lg space-y-6">
        <p className="text-sm opacity-70">Last Updated: {new Date().toLocaleDateString()}</p>

        <section>
          <h3 className="text-xl font-semibold mb-3">Information We Collect</h3>
          <p className="opacity-80 leading-relaxed">
            TeluguMoviesOTT is committed to protecting your privacy. We collect minimal information necessary to provide our service:
          </p>
          <ul className="list-disc list-inside opacity-80 space-y-2 mt-2">
            <li>Usage data through Google Analytics for improving user experience</li>
            <li>Cookie data for website functionality and preferences</li>
            <li>No personal information is directly collected or stored by us</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Cookies and Tracking</h3>
          <p className="opacity-80 leading-relaxed">
            We use cookies and similar tracking technologies to improve your browsing experience. This includes:
          </p>
          <ul className="list-disc list-inside opacity-80 space-y-2 mt-2">
            <li>Essential cookies for website functionality</li>
            <li>Analytics cookies to understand user behavior</li>
            <li>Advertising cookies from Google AdSense (if ads are displayed)</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Third-Party Services</h3>
          <p className="opacity-80 leading-relaxed">
            We use the following third-party services that may collect information:
          </p>
          <ul className="list-disc list-inside opacity-80 space-y-2 mt-2">
            <li><strong>Google Analytics:</strong> For website traffic analysis</li>
            <li><strong>Google AdSense:</strong> For displaying advertisements</li>
          </ul>
          <p className="opacity-80 leading-relaxed mt-2">
            These services have their own privacy policies. We recommend reviewing them.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Data Security</h3>
          <p className="opacity-80 leading-relaxed">
            We take reasonable measures to protect any data processed through our website. However, no internet transmission is 100% secure.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Your Rights</h3>
          <p className="opacity-80 leading-relaxed">
            You have the right to:
          </p>
          <ul className="list-disc list-inside opacity-80 space-y-2 mt-2">
            <li>Disable cookies in your browser settings</li>
            <li>Opt-out of personalized advertising</li>
            <li>Request information about data we may have</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Children's Privacy</h3>
          <p className="opacity-80 leading-relaxed">
            Our service does not target children under 13. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Changes to Privacy Policy</h3>
          <p className="opacity-80 leading-relaxed">
            We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-3">Contact</h3>
          <p className="opacity-80 leading-relaxed">
            If you have questions about this privacy policy, please contact us through our website.
          </p>
        </section>
      </div>
    </div>
  );
}
