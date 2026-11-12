# Clearer left menu

## What's wrong today
- Three levels (Finance -> Loans -> Loan EMI) look almost the same: small grey text everywhere, so groups and calculators blur together.
- Group labels ("Loans", "Investments") are lighter than the calculators under them, so they read like stray notes, not headings.
- Every section is open at once, so the menu is one long wall of ~21 grey links.
- The extra "All in Finance" link sits among calculators and adds noise.
- The indent line plus nested indents push calculator names far right in a narrow column.

## Changes
1. **Clear three-step hierarchy**
   - Category (Finance, Converters & Date): bold, normal text colour, with its icon and a calculator count, e.g. "Finance 13".
   - Group (Loans, Investments...): small uppercase label with spacing above it, acting as a heading.
   - Calculator: regular-weight readable text, one indent only; the current page gets the soft tint plus a thin sage marker on the left.
2. **Less open at once**: only the category of the page you're on starts expanded; others stay collapsed. Your open/closed choices are remembered.
3. **Category name is the link** to its overview page (chevron toggles open/close), so the "All in..." link is removed.
4. **Quick filter box** at the top of the menu that narrows the list as you type (search in the header stays as is).
5. **Spacing**: more room between groups, less between calculators, so groups read as blocks.

Mobile drawer gets the same layout and still closes after picking a calculator.

## Technical details
- Only `src/components/layout/SideNav.tsx` (+ a few `en.json` strings) change; tree still comes from the registry.
- Replace `<details>` with a button-toggled list (`aria-expanded`), state in localStorage with try/catch; default open = category from current route.
- Design-system tokens only (`text-foreground`, `text-muted-foreground`, `bg-surface`, `border-accent`), uses design-system `Input` for the filter.
- Browser check on desktop and mobile widths.
