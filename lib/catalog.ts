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
  category_level_1: string;
  category_level_2: string | null;
};

export type ShoppingListState = {
  id: number | null;
  name: string;
  selectedProductIds: number[];
};

export async function getCatalogData() {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('product_catalog')
    .select(
      'id, name, brand, product_url, photo_url, weight_grams, price, price_per_kg, category_level_1, category_level_2'
    )
    .order('category_level_1', { ascending: true })
    .order('category_level_2', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  const products = (data ?? []).map((product) => ({
    ...product,
    photo_url: product.photo_url?.trim() ? product.photo_url : null,
    price: product.price != null ? Number(product.price) : null,
    price_per_kg: product.price_per_kg != null ? Number(product.price_per_kg) : null
  })) satisfies ProductCard[];

  return { products };
}

export type CatalogGroup = {
  categoryLevel1: string;
  categoryLevel2Groups: {
    categoryLevel2: string;
    products: ProductCard[];
  }[];
};

export function groupProductsByCategory(products: ProductCard[]): CatalogGroup[] {
  const rootMap = new Map<string, Map<string, ProductCard[]>>();

  for (const product of products) {
    const level1 = product.category_level_1?.trim() || 'Sans catégorie';
    const level2 = product.category_level_2?.trim() || 'Autres';

    if (!rootMap.has(level1)) {
      rootMap.set(level1, new Map());
    }

    const level2Map = rootMap.get(level1)!;
    if (!level2Map.has(level2)) {
      level2Map.set(level2, []);
    }

    level2Map.get(level2)!.push(product);
  }

  return Array.from(rootMap.entries()).map(([categoryLevel1, level2Map]) => ({
    categoryLevel1,
    categoryLevel2Groups: Array.from(level2Map.entries()).map(([categoryLevel2, groupedProducts]) => ({
      categoryLevel2,
      products: groupedProducts
    }))
  }));
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
