'use client';

import { useState } from 'react';
import type { CatalogGroup } from '@/lib/catalog';

type ProductPickerProps = {
  groups: CatalogGroup[];
  initialSelectedIds: number[];
  initialListName: string;
};

function formatEuro(value: number | null) {
  if (value == null) {
    return 'Prix non renseigné';
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
}

export function ProductPicker({ groups, initialSelectedIds, initialListName }: ProductPickerProps) {
  const [search, setSearch] = useState('');
  const [listName, setListName] = useState(initialListName);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);

  const selectedSet = new Set(selectedIds);
  const searchTerm = search.trim().toLowerCase();
  const visibleGroups = groups
    .map((group) => {
      const categoryLevel2Groups = group.categoryLevel2Groups
        .map((subgroup) => {
          const products = subgroup.products.filter((product) => {
            if (!searchTerm) {
              return true;
            }

            return [product.name, product.brand].some((value) =>
              value.toLowerCase().includes(searchTerm)
            );
          });

          return {
            ...subgroup,
            products
          };
        })
        .filter((subgroup) => subgroup.products.length > 0);

      return {
        ...group,
        categoryLevel2Groups
      };
    })
    .filter((group) => group.categoryLevel2Groups.length > 0);

  const toggleProduct = (productId: number) => {
    setSelectedIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  return (
    <form action="/api/shopping-lists" method="post" className="space-y-6">
      <div className="rounded-[32px] border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-slate-500">
              Sélection de courses
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Choisis tes produits, puis enregistre ta liste
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex min-w-[260px] flex-col gap-2 text-sm text-slate-600">
              Nom de la liste
              <input
                name="title"
                value={listName}
                onChange={(event) => setListName(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Ma future course"
              />
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {selectedIds.length} {selectedIds.length > 1 ? 'produits sélectionnés' : 'produit sélectionné'}
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Enregistrer la liste
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex-1">
            <span className="sr-only">Rechercher un produit</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un produit ou une marque"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400"
            />
          </label>

          <p className="text-sm text-slate-500">
            La liste enregistrée gardera les `product_id` pour l’import futur dans le panier.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {visibleGroups.map((group) => {
          const totalProducts = group.categoryLevel2Groups.reduce(
            (count, subgroup) => count + subgroup.products.length,
            0
          );

          return (
            <section
              key={group.categoryLevel1}
              className="rounded-[32px] border border-slate-200/80 bg-white/75 p-5 shadow-soft backdrop-blur"
            >
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                    Catégorie principale
                  </p>
                  <h3 className="mt-1 font-[var(--font-space-grotesk)] text-2xl font-semibold tracking-tight text-slate-950">
                    {group.categoryLevel1}
                  </h3>
                </div>

                <p className="text-sm text-slate-500">
                  {totalProducts} produit{totalProducts > 1 ? 's' : ''}
                </p>
              </div>

              <div className="mt-5 space-y-5">
                {group.categoryLevel2Groups.map((subgroup) => (
                  <div key={`${group.categoryLevel1}-${subgroup.categoryLevel2}`} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-base font-semibold text-slate-950">
                        {subgroup.categoryLevel2}
                      </h4>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                        {subgroup.products.length}
                      </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {subgroup.products.map((product) => {
                        const checked = selectedSet.has(product.id);

                        return (
                          <label
                            key={product.id}
                            className={[
                              'group cursor-pointer rounded-[28px] border p-4 transition',
                              checked
                                ? 'border-slate-950 bg-slate-950 text-white shadow-soft'
                                : 'border-slate-200/80 bg-white/85 text-slate-950 hover:border-slate-300'
                            ].join(' ')}
                          >
                            <input
                              type="checkbox"
                              name="productIds"
                              value={product.id}
                              checked={checked}
                              onChange={() => toggleProduct(product.id)}
                              className="sr-only"
                            />

                            <div className="flex items-start gap-4">
                              <div
                                className={[
                                  'relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border',
                                  checked ? 'border-white/20 bg-white/10' : 'border-slate-200 bg-slate-50'
                                ].join(' ')}
                              >
                                {product.photo_url ? (
                                  <img
                                    src={product.photo_url}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                    Photo
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <h5 className="line-clamp-2 text-sm font-semibold leading-5">
                                      {product.name}
                                    </h5>
                                    <p className={checked ? 'text-xs text-white/60' : 'text-xs text-slate-500'}>
                                      {product.brand || 'Marque inconnue'}
                                    </p>
                                  </div>

                                  <span className="rounded-full border border-current/10 px-3 py-1 text-xs font-medium">
                                    {checked ? 'Choisi' : 'Ajouter'}
                                  </span>
                                </div>

                                <div className="pt-2">
                                  <div className="text-base font-semibold">{formatEuro(product.price)}</div>
                                  {product.price_per_kg != null ? (
                                    <p className={checked ? 'text-xs text-white/60' : 'text-xs text-slate-500'}>
                                      {formatEuro(product.price_per_kg)} / kg
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {visibleGroups.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
            Aucun produit ne correspond à la recherche.
          </div>
        ) : null}
      </div>
    </form>
  );
}
