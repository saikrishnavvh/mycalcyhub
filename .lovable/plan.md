# Loan charts + new "Advanced" section with A/B test calculator

## 1. Charts in Advanced Loan EMI
Add a Charts area above the existing payment table (same chart style as the basic Loan EMI page):
- **Where your money goes** (donut): principal, interest, prepayments.
- **Balance over time** (line): loan balance with prepayment vs. without, so the earlier payoff is visible.
- **Yearly split** (stacked bars): principal, interest and prepayment paid each year.

## 2. New "Advanced" section in the menu and home page
- New top-level section **Advanced** (own colour band in the left menu, own overview page at /advanced).
- First calculator: **A/B Test Significance**, modelled on abtestguide.com:
  - Inputs: visitors and conversions for A and B, confidence level (90 / 95 / 99%), one-sided or two-sided test.
  - Results: conversion rate of A and B, relative uplift, Z-score, p-value, and a clear verdict ("B is significantly better / worse / no significant difference").
  - Chart: the two conversion rates with their error ranges (bell curves or bars with intervals).
  - Explanation and FAQ text like other calculators.

## Technical details
- Loan charts: build from the existing yearly rows plus a no-prepayment baseline series added to `computeLoanAdvanced`; recharts, colours from design tokens.
- New `CategoryId` "advanced" in types/registry + i18n strings + SideNav hue (neutral/foreground band to avoid a third bright colour).
- `src/calculators/advanced/ab-test/compute.ts`: pooled two-proportion Z-test, normal CDF for p-value; tests for a known case (e.g. A 1000/100, B 1000/130 → significant at 95%) and zero-visitor validation.
