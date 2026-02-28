import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'TidePilot — Your voice, operationalized.',
  description: 'A personal brand operating system for professionals.',
};

function isValidClerkKey(key: string | undefined): boolean {
  if (!key) return false;
  const match = key.match(/^pk_(test|live)_(.+)$/);
  if (!match) return false;
  return match[2].length > 20 && match[2].endsWith('$');
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const useClerk = isValidClerkKey(clerkKey);

  if (useClerk) {
    const { ClerkProvider } = await import('@clerk/nextjs');
    return (
      <ClerkProvider>
        <html lang="en" suppressHydrationWarning>
          <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
        </html>
      </ClerkProvider>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
