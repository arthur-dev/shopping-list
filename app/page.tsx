import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ProductPicker } from '@/components/product-picker';
import { getActiveShoppingList, getCatalogData, groupProductsByCategory } from '@/lib/catalog';
import { isAuthenticated } from '@/lib/auth';

export default async function HomePage({
  searchParams
}: {
  searchParams?: Promise<{ saved?: string; error?: string }>;
}) {
  if (!(await isAuthenticated())) {
    redirect('/login');
  }

  const [{ products }, activeList, paramsRaw] = await Promise.all([
    getCatalogData(),
    getActiveShoppingList(),
    searchParams ?? Promise.resolve({})
  ]);
  const params: { saved?: string; error?: string } = paramsRaw;
  const groups = groupProductsByCategory(products);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 rounded-[32px] border border-white/70 bg-white/75 px-5 py-4 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-500">
            Shopping List
          </p>
          <h1 className="font-[var(--font-space-grotesk)] text-3xl font-semibold tracking-tight text-slate-950">
            Produits disponibles
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Sélectionne les produits qui t’intéressent et enregistre une liste réutilisable
            plus tard.
          </p>
        </div>

        <form action="/api/logout" method="post">
          <button
            type="submit"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
          >
            Se déconnecter
          </button>
        </form>
      </div>

      {params.saved ? (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Liste enregistrée.
        </div>
      ) : null}

      {params.error ? (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {params.error === 'empty'
            ? 'Sélectionne au moins un produit avant de sauvegarder.'
            : 'Impossible d’enregistrer la liste.'}
        </div>
      ) : null}

      <div className="mb-6 rounded-[28px] border border-slate-200/80 bg-white/70 p-5 shadow-soft backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Liste active</p>
            <h2 className="text-xl font-semibold text-slate-950">{activeList.name}</h2>
          </div>
          <p className="text-sm text-slate-500">
            {activeList.selectedProductIds.length}{' '}
            {activeList.selectedProductIds.length > 1 ? 'produits déjà choisis' : 'produit déjà choisi'}
          </p>
        </div>
      </div>

      <ProductPicker
        groups={groups}
        initialSelectedIds={activeList.selectedProductIds}
        initialListName={activeList.name}
      />

      <div className="mt-10 text-sm text-slate-500">
        <Link href="/login" className="underline decoration-slate-300 underline-offset-4">
          Page de connexion
        </Link>
      </div>
    </main>
  );
}
