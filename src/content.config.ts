import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { recipeSchema } from './lib/recipes/schema';
import { loadRecipes } from './lib/recipes/validate';

export const collections = {
  recipes: defineCollection({
    loader: async () =>
      (await loadRecipes()).map((recipe) => ({ id: recipe.slug, ...recipe })),
    schema: recipeSchema.safeExtend({ id: z.string() }),
  }),
};
