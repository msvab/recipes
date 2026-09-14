import { z } from 'zod';

const text = z.string().trim().min(1);
const positive = z.number().positive();
const httpUrl = z.url({ protocol: /^https?$/ });
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const permission = z
  .object({ basis: text, attribution: text, url: httpUrl.optional() })
  .strict();

export const quantitySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('number'), value: positive }).strict(),
  z
    .object({ kind: z.literal('range'), min: positive, max: positive })
    .strict()
    .refine(
      (q) => q.max >= q.min,
      'Range maximum must be at least its minimum',
    ),
  z.object({ kind: z.literal('text'), text }).strict(),
]);

const ingredient = z
  .object({
    id: slug,
    name: text,
    quantity: quantitySchema,
    unit: z.enum(['g', 'kg', 'ml', 'l', 'ks', 'cup', 'tbsp', 'tsp']).optional(),
    note: text.optional(),
    approximate: z.boolean().optional(),
  })
  .strict()
  .superRefine((i, ctx) => {
    if (i.quantity.kind !== 'text' && !i.unit)
      ctx.addIssue({
        code: 'custom',
        message: 'Numeric ingredients require a unit',
        path: ['unit'],
      });
    if (i.quantity.kind === 'text' && i.unit)
      ctx.addIssue({
        code: 'custom',
        message: 'Qualitative quantities must not have a unit',
        path: ['unit'],
      });
  });

const imagePath = z
  .string()
  .regex(
    /^[a-z0-9][a-z0-9-]*\.(jpg|jpeg|png|webp|avif)$/,
    'Use a filename inside src/assets/recipes (no directories or remote URLs)',
  );
const imageSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('placeholder') }).strict(),
  z.object({ kind: z.literal('owner'), file: imagePath, alt: text }).strict(),
  z
    .object({
      kind: z.literal('licensed'),
      file: imagePath,
      alt: text,
      permission,
    })
    .strict(),
  z.object({ kind: z.literal('ai'), file: imagePath, alt: text }).strict(),
]);

export const recipeSchema = z
  .object({
    schemaVersion: z.literal(1),
    slug,
    title: text,
    description: text.optional(),
    demo: z.boolean().default(false),
    yield: z
      .object({ amount: positive, label: z.enum(['porce', 'kusy']) })
      .strict(),
    prepMinutes: z.number().int().nonnegative().optional(),
    cookMinutes: z.number().int().nonnegative().optional(),
    category: text,
    tags: z
      .array(text)
      .refine((tags) => new Set(tags).size === tags.length, 'Duplicate tags'),
    ingredients: z
      .array(
        z
          .object({ title: text.optional(), items: z.array(ingredient).min(1) })
          .strict(),
      )
      .min(1),
    steps: z.array(text).min(1),
    sources: z.array(
      z
        .object({ url: httpUrl, author: text, importedAt: z.iso.date() })
        .strict(),
    ),
    provenance: z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('own') }).strict(),
      z.object({ kind: z.literal('facts') }).strict(),
      z.object({ kind: z.literal('licensed'), permission }).strict(),
    ]),
    image: imageSchema,
  })
  .strict()
  .superRefine((recipe, ctx) => {
    const ids = recipe.ingredients.flatMap((group) =>
      group.items.map((i) => i.id),
    );
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({
        code: 'custom',
        message: 'Ingredient IDs must be unique',
        path: ['ingredients'],
      });
    if (recipe.provenance.kind !== 'own' && recipe.sources.length === 0)
      ctx.addIssue({
        code: 'custom',
        message: 'Imported recipes require a source',
        path: ['sources'],
      });
  });

export type Recipe = z.infer<typeof recipeSchema>;
export type Quantity = z.infer<typeof quantitySchema>;
export type Ingredient = Recipe['ingredients'][number]['items'][number];
