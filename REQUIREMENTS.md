# Recipe collection requirements

Status: agreed high-level requirements; v1 implementation completed locally on 2026-09-14. See README.md for operation and deployment.

## Purpose

Create a personal recipe collection that is easy to maintain through Codex and publicly accessible through a web application. Prefer free hosting and minimal maintenance.

## V1 scope

### Access and authoring

- Anyone can browse and read recipes without signing in.
- Only the owner can add, edit, delete, and publish recipes.
- A Codex skill handles recipe preparation and maintenance, including publishing through authenticated GitHub access.
- GitHub authentication is acceptable to the owner. Publication must be restricted to the owner's authorized access.
- The website does not need a sign-in screen, upload form, or recipe editor.
- The public website must work well on phones and desktops. Mobile authoring is not a v1 requirement.

### Recipe import and review

- The skill accepts a recipe website URL, pasted recipe text, or a recipe available in the current Codex conversation.
- Recipes created in ChatGPT can be copied into Codex for processing.
- The skill converts input into a consistent, portable recipe format.
- Fetch and process website content where possible; allow pasted text as a fallback. Successful automatic extraction from every website is not required.
- Preserve the original source link and attribution when available.
- Present the prepared recipe for review before publishing, and support corrections through conversation.
- Flag missing information and uncertain conversions rather than inventing recipe details.

### Public-content reuse policy

- By default, extract ingredients, quantities, and practical cooking facts, then write fresh, concise Czech instructions that faithfully describe the method.
- Do not copy a source's stories, distinctive descriptions, or other protected wording without permission or a suitable licence. AI paraphrasing alone is not evidence that reuse is permitted.
- Reproduce or translate protected source text only when permission or a licence allows the intended reuse, including translation where applicable.
- Preserve source links and author credit. Attribution alone does not replace permission.
- For reused protected text, record the permission or licence basis and comply with its conditions, including required attribution.
- If reuse permission is unclear, omit the affected text and flag the issue during review. A recipe may still publish using independently written factual instructions.
- Apply this policy to both the public website and public repository. Do not commit unapproved source copies or images as intermediate import files.
- This policy reduces publishing risk; it is not a guarantee that every imported recipe is legally cleared.

### Recipe content

- Recipe title.
- Ingredient quantities and instructions.
- Numbered preparation steps.
- Original serving count or yield, used as the basis for scaling.
- Preparation and cooking times when available.
- Tags and/or categories.
- Source attribution and link when available.
- Text-only recipe pages; no recipe images or placeholders.

### Language and measurements

- Recipe text and website interface are in Czech.
- Prepare Czech instructions from the imported cooking facts while preserving the method and source attribution. Translate protected source wording only when permitted under the public-content reuse policy.
- Use metric measurements by default, including grams, kilograms, millilitres, litres, and degrees Celsius.
- Cups and spoons are acceptable and do not need to be converted to weight or volume.
- Convert units such as ounces, pounds, and degrees Fahrenheit to metric.
- Preserve natural ingredient counts, such as two eggs, and qualitative amounts, such as salt to taste.
- Mark approximate conversions where relevant.

### Serving-size adjustment

- Readers can change the serving count.
- Scale numeric ingredient quantities relative to the recipe's original serving count.
- Do not automatically scale cooking times or temperatures.
- Preserve qualitative quantities such as "to taste."

### Text-only presentation

- Do not import, store, generate, or display recipe photos or illustrations.
- No image placeholders, image attribution fields, or photo-permission prompts.

### Browsing and discovery

- Provide text search.
- Provide browsing or filtering by tags/categories.
- Give each recipe a permanent, shareable link.
- Present ingredients and steps in a readable layout suitable for cooking, including on a phone.

### Storage, publishing, and cost

- Prefer portable recipe files in a public GitHub repository, with version history and straightforward backup/export.
- Automatically publish website updates after an authorized recipe change is accepted into the publishing workflow.
- Prefer free hosting and avoid recurring infrastructure costs.
- Consider a paid service only when it provides a concrete benefit that justifies the cost to the owner.
- Public recipe content is acceptable; credentials and publishing secrets must not be public.

## Leading architecture candidate

A static website hosted on GitHub Pages, built from recipe files in a public GitHub repository, with authoring and publishing handled through Codex.

The recipe schema, frontend technology, repository layout, skill packaging, validation, and deployment workflow remain implementation decisions.

## Deferred scope

### V2

- Direct publishing from a ChatGPT conversation, including on a phone.
- The authenticated connection needed for ChatGPT to write recipes to GitHub.

### Outside V1, with no committed release

- Website-based importing or editing.
- Website user accounts, multiple editors, and collaboration features.
- A dedicated scraping or AI backend for the website.

## V1 acceptance criteria

1. The owner can give Codex a recipe URL or pasted recipe, review the resulting Czech recipe, and publish it through the authorized GitHub workflow.
2. When URL extraction fails, the owner can continue by pasting the recipe text.
3. The owner can update or delete an existing recipe through the skill and publish the change.
4. Public visitors can browse, search, filter, and open recipes without authentication on phone and desktop.
5. Changing servings scales numeric ingredient quantities without changing temperatures or cooking times.
6. Recipes follow the agreed Czech language and measurement conventions.
7. Recipe cards and pages display text only, without image areas or placeholders.
8. Public visitors cannot publish changes using the website or access publishing credentials.
9. The proposed deployment uses free hosting unless the owner explicitly accepts a justified paid alternative.
10. Imported recipes use fresh Czech instructions based on cooking facts unless reuse of the original protected wording is permitted; copied blog stories and distinctive descriptions are excluded by default.
11. Reused protected text have a recorded permission or licence basis, with required attribution. When permission is unclear, the affected material is excluded from both the website and public repository.
