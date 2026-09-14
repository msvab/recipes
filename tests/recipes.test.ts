import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { recipeSchema } from '../src/lib/recipes/schema';
import { loadRecipes } from '../src/lib/recipes/validate';
import {
  formatIngredient,
  scaledQuantity,
  formatNumber,
} from '../src/lib/recipes/quantities';
import {
  filtersFromURL,
  filtersToURL,
  matches,
  searchEntry,
} from '../src/lib/recipes/search';
import sample from './fixtures/recipe.json';

test('sample recipes validate and asset collection loads', async () => {
  assert.ok((await loadRecipes()).length >= 0);
});
test('schema rejects unsupported units, invalid yield, duplicate IDs and reversed ranges', () => {
  for (const mutate of [
    (r: any) => {
      r.yield.amount = 0;
    },
    (r: any) => {
      r.ingredients[0].items[0].unit = 'oz';
    },
    (r: any) => {
      r.ingredients[0].items[1].id = r.ingredients[0].items[0].id;
    },
    (r: any) => {
      r.ingredients[0].items[0].quantity = { kind: 'range', min: 3, max: 1 };
    },
    (r: any) => {
      r.image = { kind: 'owner', file: '../private.jpg', alt: 'Foto' };
    },
    (r: any) => {
      r.sources = [
        { url: 'javascript:alert(1)', author: 'x', importedAt: '2026-09-14' },
      ];
    },
  ]) {
    const recipe = structuredClone(sample);
    mutate(recipe);
    assert.equal(recipeSchema.safeParse(recipe).success, false);
  }
});
test('permission requirements apply to protected text and third-party photos', () => {
  assert.equal(
    recipeSchema.safeParse({ ...sample, provenance: { kind: 'facts' } })
      .success,
    false,
  );
  assert.equal(
    recipeSchema.safeParse({
      ...sample,
      image: { kind: 'licensed', file: 'photo.jpg', alt: 'Foto' },
    }).success,
    false,
  );
  const sources = [
    {
      url: 'https://example.com/recipe',
      author: 'Author',
      importedAt: '2026-09-14',
    },
  ];
  const permission = {
    basis: 'CC BY 4.0',
    attribution: 'Author',
    url: 'https://creativecommons.org/licenses/by/4.0/',
  };
  assert.equal(
    recipeSchema.safeParse({
      ...sample,
      sources,
      provenance: { kind: 'licensed', permission },
      image: { kind: 'licensed', file: 'photo.jpg', alt: 'Foto', permission },
    }).success,
    true,
  );
  assert.equal(
    recipeSchema.safeParse({
      ...sample,
      image: { kind: 'ai', file: 'photo.webp', alt: 'Ilustrace' },
    }).success,
    true,
  );
});
test('loader rejects duplicate slugs and missing photo files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'recipes-test-'));
  try {
    await mkdir(join(root, 'recipes'));
    await writeFile(
      join(root, 'recipes', `${sample.slug}.json`),
      JSON.stringify(sample),
    );
    await writeFile(
      join(root, 'recipes', 'duplicate.json'),
      JSON.stringify(sample),
    );
    await assert.rejects(
      loadRecipes(root),
      /Duplicate slug|Filename must match/,
    );
    await rm(join(root, 'recipes', 'duplicate.json'));
    await writeFile(
      join(root, 'recipes', `${sample.slug}.json`),
      JSON.stringify({
        ...sample,
        image: { kind: 'owner', file: 'missing.jpg', alt: 'Foto' },
      }),
    );
    await assert.rejects(loadRecipes(root), /ENOENT/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test('scaling preserves source data and qualitative amounts, supports ranges and fractions', () => {
  const original = recipeSchema.parse(sample);
  const ingredient = original.ingredients[0].items[0];
  assert.equal(formatIngredient(ingredient, 2), '400 g');
  assert.equal(formatIngredient(ingredient, 1), '200 g');
  assert.equal(
    ingredient.quantity.kind === 'number' && ingredient.quantity.value,
    200,
  );
  assert.deepEqual(scaledQuantity({ kind: 'range', min: 1, max: 2 }, 1.5), {
    kind: 'range',
    min: 1.5,
    max: 3,
  });
  assert.equal(
    formatIngredient(original.ingredients[0].items.at(-1)!, 8),
    'podle chuti',
  );
  assert.equal(
    formatIngredient(
      { ...ingredient, unit: 'ks', quantity: { kind: 'number', value: 1 } },
      0.5,
    ),
    '0,5 ks',
  );
  assert.notEqual(formatNumber(0.00001), '0');
  assert.equal(formatNumber(0.1 + 0.2), '0,3');
  assert.throws(() => scaledQuantity(ingredient.quantity, 0));
  assert.equal(original.cookMinutes, 15);
});
test('cup and spoon labels use Czech integer and fractional forms', () => {
  const ingredient = recipeSchema.parse(sample).ingredients[0].items[0];
  assert.equal(
    formatIngredient({
      ...ingredient,
      unit: 'cup',
      quantity: { kind: 'number', value: 5 },
    }),
    '5 hrnků',
  );
  assert.equal(
    formatIngredient({
      ...ingredient,
      unit: 'cup',
      quantity: { kind: 'number', value: 0.5 },
    }),
    '0,5 hrnku',
  );
  assert.equal(
    formatIngredient({
      ...ingredient,
      unit: 'tsp',
      quantity: { kind: 'number', value: 5 },
    }),
    '5 lžiček',
  );
});

test('Czech search combines all words, category, and every selected tag', () => {
  const entry = searchEntry(recipeSchema.parse(sample));
  assert.equal(
    matches(entry, {
      query: 'CITRONOVE hrasek',
      category: 'Hlavní jídla',
      tags: ['Do 30 minut', 'Vegetariánské'],
    }),
    true,
  );
  assert.equal(
    matches(entry, { query: '', category: 'Snídaně', tags: [] }),
    false,
  );
  assert.equal(
    matches(entry, { query: '', category: '', tags: ['Sladké'] }),
    false,
  );
  assert.equal(
    matches(entry, { query: 'neexistuje', category: '', tags: [] }),
    false,
  );
});
test('filter URLs preserve Unicode tags, unrelated params, and empty reset', () => {
  const filters = {
    query: 'česnek',
    category: 'Hlavní jídla',
    tags: ['Do 30 minut', 'Vegetariánské'],
  };
  const url = filtersToURL(
    new URL('https://example.com/recipes/?other=1'),
    filters,
  );
  assert.deepEqual(filtersFromURL(url), filters);
  assert.equal(
    filtersToURL(url, { query: '', category: '', tags: [] }).search,
    '?other=1',
  );
});
