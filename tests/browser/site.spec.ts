import { test, expect } from '@playwright/test';
import { loadRecipes } from '../../src/lib/recipes/validate';
import { formatIngredient } from '../../src/lib/recipes/quantities';
import { matches, searchEntry } from '../../src/lib/recipes/search';

const recipes = await loadRecipes();
const recipe = recipes.find((r) =>
  r.ingredients.some((g) => g.items.some((i) => i.quantity.kind !== 'text')),
);

test('collection search, filters, reset and history work at project base path', async ({
  page,
}) => {
  await page.goto('./');
  await expect(page.locator('.recipe-card')).toHaveCount(recipes.length);
  await page.getByRole('searchbox').fill('zzzz-no-match-98765');
  await expect(page.locator('.recipe-card:visible')).toHaveCount(0);
  if (recipes.length) {
    await expect(page.getByText('Tady je zatím prázdný talíř.')).toBeVisible();
    await page
      .getByRole('button', { name: 'Zobrazit všechny recepty' })
      .click();
  } else await page.getByRole('button', { name: 'Zrušit filtry' }).click();
  await expect(page.locator('.recipe-card:visible')).toHaveCount(
    recipes.length,
  );
  if (recipe) {
    await page.getByRole('searchbox').fill(recipe.title);
    const expected = recipes.filter((r) =>
      matches(searchEntry(r), { query: recipe.title, category: '', tags: [] }),
    ).length;
    await expect(page.locator('.recipe-card:visible')).toHaveCount(expected);
    await page.reload();
    await expect(page.getByRole('searchbox')).toHaveValue(recipe.title);
    await page.getByRole('button', { name: 'Zrušit filtry' }).click();
    await page.goBack();
    await expect(page.getByRole('searchbox')).toHaveValue(recipe.title);
    if (recipe.tags.length) {
      await page.getByRole('button', { name: 'Zrušit filtry' }).click();
      await page.getByLabel(recipe.tags[0], { exact: true }).check();
      await expect(page.locator('.recipe-card:visible')).toHaveCount(
        recipes.filter((r) => r.tags.includes(recipe.tags[0])).length,
      );
    }
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('deep recipe links scale ingredients, preserve steps, and reset', async ({
  page,
}) => {
  test.skip(!recipe, 'No numeric recipe in collection');
  const r = recipe!;
  await page.goto('recepty/' + r.slug + '/');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: r.title, exact: true }),
  ).toBeVisible();
  const steps = await page.locator('.steps-panel').textContent();
  const ingredients = r.ingredients.flatMap((g) => g.items);
  const input = page.getByLabel('Množství (' + r.yield.label + ')');
  await input.fill(String(r.yield.amount * 2));
  for (let i = 0; i < ingredients.length; i++) {
    await expect(page.locator('.ingredient-amount').nth(i)).toHaveText(
      formatIngredient(ingredients[i], 2),
    );
  }
  expect(await page.locator('.steps-panel').textContent()).toBe(steps);
  await page.getByRole('button', { name: 'Původní množství' }).click();
  await expect(page.locator('.ingredient-amount').first()).toHaveText(
    formatIngredient(ingredients[0]),
  );
  await input.fill('0');
  await expect(page.locator('.ingredient-amount').first()).toHaveText(
    formatIngredient(ingredients[0]),
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole('link', { name: 'Zpět do kuchařky' }).click();
  await expect(page).toHaveURL(/\/recipes\/$/);
});

test('recipe remains readable without JavaScript', async ({ browser }) => {
  test.skip(!recipe, 'Empty collection');
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(
    'http://127.0.0.1:4322/recipes/recepty/' + recipe!.slug + '/',
  );
  await expect(page.getByRole('heading', { name: 'Suroviny' })).toBeVisible();
  await expect(page.locator('.ingredient-amount').first()).toHaveText(
    formatIngredient(recipe!.ingredients[0].items[0]),
  );
  await expect(page.locator('#serving-controls')).toBeHidden();
  await context.close();
});
