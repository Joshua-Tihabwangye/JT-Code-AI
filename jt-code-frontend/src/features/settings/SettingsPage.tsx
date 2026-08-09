import { UserProfile } from '@clerk/clerk-react';

export function SettingsPage() {
  return (
    <section className="workspace">
      <header className="workspace-header"><div><p className="eyebrow">CLERK IDENTITY</p><h1>Account settings</h1></div></header>
      <div className="settings-panel"><UserProfile routing="hash" /></div>
    </section>
  );
}
