// frontend/src/pages/DataDeletionPage.jsx
// Public, unauthenticated page — required by Facebook OAuth app configuration
// ("Data deletion instructions URL", Settings → Basic).

function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Deleting Your Data</h1>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">In the app</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Log in to chatify.</li>
            <li>Open Settings (gear icon next to your profile).</li>
            <li>Select "Delete Account."</li>
            <li>Confirm — this is permanent and immediate.</li>
          </ol>
          <p>
            This permanently removes your account, profile information, and messages from our
            database. There is no recovery period — once confirmed, the data is gone.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Signed in via Google, GitHub, or Facebook?</h2>
          <p>
            Deleting your chatify account removes your data from chatify, but does not revoke that
            provider's own access grant to chatify. To fully disconnect chatify from your
            Google/GitHub/Facebook account, do so from that provider's own account settings (e.g.
            Google: myaccount.google.com/permissions).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">Can't log in to delete your account?</h2>
          <p>Email peterdanwan@gmail.com with the email address on your account.</p>
        </section>
      </div>
    </div>
  );
}
export default DataDeletionPage;
