import { loadRecipes } from '../src/lib/recipes/validate';

try {
  const recipes = await loadRecipes();
  console.log(`Validated ${recipes.length} recipes.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
