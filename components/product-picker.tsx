'use client';

import { useState } from 'react';
import type { ProductCard } from '@/lib/catalog';

type ProductPickerProps = {
  products: ProductCard[];
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

export function ProductPicker({ products, initialSelectedIds, initialListName }: ProductPickerProps) {
  const [search, setSearch] = useState('');
  const [listName, setListName] = useState(initialListName);
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);

  const selectedSet = new Set(selectedIds);
  const searchTerm = search.trim().toLowerCase();

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
              {selectedIds.length} produit
              {selectedIds.length > 1 ? 's' : ''} sélectionné
              {selectedIds.length > 1 ? 's' : ''}
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {products.map((product) => {
          const checked = selectedSet.has(product.id);
          const isVisible =
            !searchTerm ||
            [product.name, product.brand].some((value) => value.toLowerCase().includes(searchTerm));

          return (
            <label
              key={product.id}
              className={[
                isVisible ? 'block' : 'hidden',
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
                      <h3 className="line-clamp-2 text-sm font-semibold leading-5">
                        {product.name}
                      </h3>
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
    </form>
  );
}
