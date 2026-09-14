import type { Recipe } from './schema';

export const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('cs').trim();
export type SearchEntry = {
  slug: string;
  text: string;
  category: string;
  tags: string[];
};
export type Filters = { query: string; category: string; tags: string[] };

export function searchEntry(recipe: Recipe): SearchEntry {
  return {
    slug: recipe.slug,
    category: recipe.category,
    tags: recipe.tags,
    text: normalize(
      [
        recipe.title,
        recipe.description || '',
        recipe.category,
        ...recipe.tags,
        ...recipe.ingredients.flatMap((g) => g.items.map((i) => i.name)),
        ...recipe.steps,
      ].join(' '),
    ),
  };
}
export function matches(entry: SearchEntry, filters: Filters) {
  return (
    (!filters.category || entry.category === filters.category) &&
    filters.tags.every((tag) => entry.tags.includes(tag)) &&
    normalize(filters.query)
      .split(/\s+/)
      .filter(Boolean)
      .every((word) => entry.text.includes(word))
  );
}
export function filtersFromURL(url: URL): Filters {
  return {
    query: url.searchParams.get('q') || '',
    category: url.searchParams.get('category') || '',
    tags: url.searchParams.getAll('tag'),
  };
}
export function filtersToURL(url: URL, filters: Filters): URL {
  const result = new URL(url);
  for (const key of ['q', 'category', 'tag']) result.searchParams.delete(key);
  if (filters.query) result.searchParams.set('q', filters.query);
  if (filters.category) result.searchParams.set('category', filters.category);
  for (const tag of filters.tags) result.searchParams.append('tag', tag);
  return result;
}
