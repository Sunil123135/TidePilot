import { Suspense } from 'react';
import { LinkedInSettingsPanel } from './linkedin-settings';
import { getLinkedInConnection, getLinkedInPosts } from '@/app/actions/linkedin';

export default async function SettingsPage() {
  const [connection, posts] = await Promise.all([
    getLinkedInConnection(),
    getLinkedInPosts(),
  ]);

  const isLinkedInConfigured = !!(
    process.env.LINKEDIN_CLIENT_ID &&
    process.env.LINKEDIN_CLIENT_SECRET &&
    !process.env.LINKEDIN_CLIENT_ID.includes('replace')
  );

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage integrations and workspace settings.</p>
      </div>

      <section>
        <h2 className="text-base font-semibold mb-4">Integrations</h2>
        <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
          <LinkedInSettingsPanel
            connection={connection}
            posts={posts}
            isLinkedInConfigured={isLinkedInConfigured}
          />
        </Suspense>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-4">Environment</h2>
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">LinkedIn App</span>
            <span className={process.env.LINKEDIN_CLIENT_ID ? 'text-green-600' : 'text-amber-600'}>
              {process.env.LINKEDIN_CLIENT_ID ? 'Configured' : 'Not configured'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">OpenAI API</span>
            <span className={process.env.OPENAI_API_KEY ? 'text-green-600' : 'text-amber-600'}>
              {process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Clerk Auth</span>
            {(() => {
              const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
              const valid = /^pk_(test|live)_.{10,}/.test(key.trim());
              return (
                <span className={valid ? 'text-green-600' : 'text-amber-600'}>
                  {valid ? 'Configured' : 'Not configured (placeholder)'}
                </span>
              );
            })()}
          </div>
        </div>
      </section>
    </div>
  );
}
