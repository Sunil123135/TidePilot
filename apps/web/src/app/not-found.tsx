import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">This page could not be found.</p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  );
}
