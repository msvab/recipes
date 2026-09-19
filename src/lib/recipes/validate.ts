import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { recipeSchema, type Recipe } from './schema';

export async function loadRecipes(root = process.cwd()): Promise<Recipe[]> {
  const files = (await readdir(resolve(root, 'recipes')))
    .filter((file) => file.endsWith('.json'))
    .sort();
  const recipes: Recipe[] = [];
  const slugs = new Set<string>();
  for (const file of files) {
    try {
      const recipe = recipeSchema.parse(
        JSON.parse(await readFile(resolve(root, 'recipes', file), 'utf8')),
      );
      if (slugs.has(recipe.slug))
        throw new Error(`Duplicate slug: ${recipe.slug}`);
      slugs.add(recipe.slug);
      if (file !== `${recipe.slug}.json`)
        throw new Error('Filename must match slug');
      recipes.push(recipe);
    } catch (error) {
      throw new Error(
        `${file}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return recipes;
}
