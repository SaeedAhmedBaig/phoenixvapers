# @phoenix/design-system

The single styling source for the platform (spec §16.6): Phoenix design tokens,
and — as the platform grows — the shared component library and Storybook catalogue.

## Usage

In an app's global stylesheet (Tailwind v4):

```css
@import "tailwindcss";
@import "@phoenix/design-system/tokens.css";
```

Tokens become Tailwind utilities automatically, e.g. `bg-bone`, `text-deep-pine`,
`bg-phoenix-green`.

## Rules

- **Brand Identity Book values.** Tokens align with Vol. 1 Ch. 18–19 (Phoenix Green, Deep Pine, Ink Green, Bone).
- **Deep Pine rule.** Never render Phoenix Green body text on a light background — use `pine` for green text (WCAG 2.2 AA).
- **No local styling.** Apps must not define their own colours or type scale; add or change tokens here instead.
