import { createSupabaseAdminClient } from '@/lib/supabase';

export type ProductCard = {
  id: number;
  name: string;
  brand: string;
  product_url: string;
  photo_url: string | null;
  weight_grams: number | null;
  price: number | null;
  price_per_kg: number | null;
};

export type ShoppingListState = {
  id: number | null;
  name: string;
  selectedProductIds: number[];
};

type ProductRow = {
  id: number;
  name: string;
  brand: string;
  product_url: string;
  photo_url: string | null;
  weight_grams: number | null;
};

type PriceRow = {
  product_id: number;
  price: number;
  price_per_kg: number | null;
  valid_from: string;
};

export async function getCatalogData() {
  const supabase = createSupabaseAdminClient();

  const [productsResult, pricesResult] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, brand, product_url, photo_url, weight_grams')
      .order('name', { ascending: true }),
    supabase
      .from('product_prices')
      .select('product_id, price, price_per_kg, valid_from')
      .order('valid_from', { ascending: false })
  ]);

  if (productsResult.error) {
    throw productsResult.error;
  }

  if (pricesResult.error) {
    throw pricesResult.error;
  }

  const latestPrices = new Map<number, PriceRow>();
  for (const row of pricesResult.data ?? []) {
    if (!latestPrices.has(row.product_id)) {
      latestPrices.set(row.product_id, row);
    }
  }

  const products = (productsResult.data ?? []).map((product: ProductRow) => {
    const price = latestPrices.get(product.id);
    const photoUrl = product.photo_url?.trim() ? product.photo_url : null;

    return {
      ...product,
      photo_url: photoUrl,
      price: price ? Number(price.price) : null,
      price_per_kg: price?.price_per_kg != null ? Number(price.price_per_kg) : null
    } satisfies ProductCard;
  });

  return { products };
}

export async function getActiveShoppingList() {
  const supabase = createSupabaseAdminClient();

  const { data: lists, error: listError } = await supabase
    .from('shopping_lists')
    .select('id, name')
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (listError) {
    throw listError;
  }

  const activeList = lists?.[0];
  if (!activeList) {
    return {
      id: null,
      name: 'Ma future course',
      selectedProductIds: []
    } satisfies ShoppingListState;
  }

  const { data: items, error: itemsError } = await supabase
    .from('shopping_list_items')
    .select('product_id')
    .eq('shopping_list_id', activeList.id)
    .order('position', { ascending: true });

  if (itemsError) {
    throw itemsError;
  }

  return {
    id: activeList.id,
    name: activeList.name,
    selectedProductIds: (items ?? []).map((item) => item.product_id)
  } satisfies ShoppingListState;
}
