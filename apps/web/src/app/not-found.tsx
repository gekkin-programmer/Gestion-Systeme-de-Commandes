import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <lord-icon
        src="https://cdn.lordicon.com/lecprnjb.json"
        trigger="loop"
        colors="primary:#f97316,secondary:#1a1a1a"
        style={{ width: 80, height: 80 }}
      />
      <h1 className="text-2xl font-bold text-gray-900">Page introuvable</h1>
      <p className="text-gray-500">Cette page n'existe pas ou a été déplacée.</p>
      <Link
        href="/fr"
        className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
