# Make the visit counter stand out

## What changes
- Move the counter out of the small copyright line into its own spot at the top of the footer, on the right side next to the links (stacked below them on phones).
- Show it as a rounded pill: a small eye/people icon, the number in larger bold text, and the word "visits" in softer text, e.g. **12,480** visits.
- Use the sage accent tint for the pill so it is the one coloured highlight in the footer.
- While the number loads, keep the space reserved so the footer doesn't jump.
- Counting rules stay the same (each browser counted once per 6 hours).

## Technical details
- Footer.tsx only: flex row `justify-between` for nav + counter; pill uses `bg-accent/10 text-foreground border border-border rounded-full` tokens, number `text-base font-semibold tabular-nums`, label `text-muted-foreground`, lucide `Users` icon.
- Split i18n string into `footer.visitsLabel` ("visits"); number via `formatNumber`.
