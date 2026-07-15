// frontend/src/pages/PrivacyPolicyPage.jsx
// Public, unauthenticated page — required by Google/Facebook OAuth app configuration.

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="text-slate-400 text-sm">Last updated: 2026-07-14</p>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">What we collect</h2>
          <p>
            When you create an account, we store your email address, display name, username, and
            (optionally) a profile picture. If you sign in with Google, GitHub, or Facebook, we
            store the unique account ID that provider gives us so we can recognize you on future
            logins, along with whatever name/email/photo that provider shares with us. Messages you
            send through chatify are stored so conversations persist between sessions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">How we use it</h2>
          <p>
            Solely to operate the chat application: authenticating you, displaying your profile to
            people you've added as contacts, and delivering messages. We don't sell your data or
            share it with advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Third-party services</h2>
          <p>
            We use Cloudinary to host uploaded profile pictures, Resend to send transactional email
            (e.g. a welcome email on signup), and Arcjet for rate-limiting/bot protection. These
            services process data only as needed to provide those specific functions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Deleting your data</h2>
          <p>
            You can permanently delete your account and all associated data at any time — see our{' '}
            <a href="/data-deletion" className="text-cyan-400 underline">
              data deletion instructions
            </a>
            .
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p>Questions about this policy: peterdanwan@gmail.com</p>
        </section>
      </div>
    </div>
  );
}
export default PrivacyPolicyPage;
