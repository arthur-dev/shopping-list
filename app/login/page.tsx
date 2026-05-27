import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  if (await isAuthenticated()) {
    redirect('/');
  }

  const params: { error?: string } = await (searchParams ?? Promise.resolve({}));

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-12">
      <div className="w-full rounded-[32px] border border-white/80 bg-white/80 p-8 shadow-soft backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-500">
          Accès privé
        </p>
        <h1
          className="mt-3 text-3xl font-semibold tracking-tight text-slate-950"
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          shopping-list
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Entre le mot de passe partagé pour accéder à la sélection de produits.
        </p>

        {params.error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            Mot de passe incorrect.
          </div>
        ) : null}

        <form action="/api/login" method="post" className="mt-6 space-y-4">
          <label className="block text-sm text-slate-600">
            Mot de passe
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Entrer
          </button>
        </form>
      </div>
    </main>
  );
}
