import { BadgePercent, CalendarClock, Landmark, LineChart, PiggyBank, Receipt, Sprout, Tag, TrendingUp, Wallet } from "lucide-react";
import { t } from "@/i18n";
import { simpleCalculator, type FieldSpec } from "../kit/simple";
import * as c from "./compute";

const money = (key: string, max = 100_000_000): FieldSpec => ({ key, kind: "money", positive: true, slider: { min: 0, max: Math.min(max, 10_000_000), step: max > 1_000_000 ? 10_000 : 500 } });
const rate = (key = "rate", max = 50): FieldSpec => ({ key, kind: "percent", max, slider: { min: 0, max, step: 0.1 } });
const years: FieldSpec = { key: "years", kind: "years", positive: true, max: 100, slider: { min: 1, max: 40, step: 1 } };
const inv = t("subcategory.investing"), dep = t("subcategory.deposits"), shop = t("subcategory.tax");

export const financeMore = [
  simpleCalculator({ id: "sip", category: "finance", subcategory: inv, icon: Sprout, keywords: ["sip", "mutual fund", "monthly investment", "systematic"],
    fields: [{ ...money("monthly"), slider: { min: 500, max: 200_000, step: 500 } }, rate("rate", 30), years], defaults: { monthly: 10000, rate: 12, years: 10 },
    compute: c.sip, outputs: [{ key: "maturity", kind: "money" }, { key: "invested", kind: "money" }, { key: "returns", kind: "money" }], related: ["lumpsum", "cagr", "inflation"] }),
  simpleCalculator({ id: "lumpsum", category: "finance", subcategory: inv, icon: TrendingUp, keywords: ["lumpsum", "one-time investment", "future value"],
    fields: [money("principal"), rate("rate", 30), years], defaults: { principal: 100000, rate: 12, years: 10 },
    compute: c.lumpsum, outputs: [{ key: "maturity", kind: "money" }, { key: "invested", kind: "money" }, { key: "returns", kind: "money" }], related: ["sip", "compound-interest", "cagr"] }),
  simpleCalculator({ id: "cagr", category: "finance", subcategory: inv, icon: LineChart, keywords: ["cagr", "growth rate", "annual return"],
    fields: [money("startValue"), money("endValue"), years], defaults: { startValue: 100000, endValue: 200000, years: 5 },
    compute: c.cagr, outputs: [{ key: "cagr", kind: "percent" }, { key: "totalGrowth", kind: "percent" }], related: ["lumpsum", "sip"] }),
  simpleCalculator({ id: "inflation", category: "finance", subcategory: inv, icon: Wallet, keywords: ["inflation", "purchasing power", "future cost"],
    fields: [money("amount"), rate("rate", 30), years], defaults: { amount: 100000, rate: 6, years: 10 },
    compute: c.inflation, outputs: [{ key: "futureCost", kind: "money" }, { key: "purchasingPower", kind: "money" }], related: ["sip", "cagr"] }),
  simpleCalculator({ id: "fd", category: "finance", subcategory: dep, icon: Landmark, keywords: ["fd", "fixed deposit", "term deposit", "bank"],
    fields: [money("principal"), rate("rate", 20), years], defaults: { principal: 100000, rate: 7, years: 5 },
    compute: c.fd, outputs: [{ key: "maturity", kind: "money" }, { key: "invested", kind: "money" }, { key: "interest", kind: "money" }], related: ["rd", "compound-interest"] }),
  simpleCalculator({ id: "rd", category: "finance", subcategory: dep, icon: PiggyBank, keywords: ["rd", "recurring deposit", "monthly saving"],
    fields: [{ ...money("monthly"), slider: { min: 500, max: 200_000, step: 500 } }, rate("rate", 20), years], defaults: { monthly: 5000, rate: 7, years: 5 },
    compute: c.rd, outputs: [{ key: "maturity", kind: "money" }, { key: "invested", kind: "money" }, { key: "interest", kind: "money" }], related: ["fd", "sip"] }),
  simpleCalculator({ id: "compound-interest", category: "finance", subcategory: dep, icon: CalendarClock, keywords: ["compound interest", "compounding", "interest"],
    fields: [money("principal"), rate("rate", 50), years, { key: "perYear", kind: "number", positive: true, max: 365, slider: { min: 1, max: 12, step: 1 } }],
    defaults: { principal: 100000, rate: 8, years: 10, perYear: 12 },
    compute: c.compound, outputs: [{ key: "maturity", kind: "money" }, { key: "interest", kind: "money" }], related: ["simple-interest", "fd", "lumpsum"] }),
  simpleCalculator({ id: "simple-interest", category: "finance", subcategory: dep, icon: Receipt, keywords: ["simple interest", "interest"],
    fields: [money("principal"), rate("rate", 50), years], defaults: { principal: 100000, rate: 8, years: 5 },
    compute: c.simple, outputs: [{ key: "interest", kind: "money" }, { key: "maturity", kind: "money" }], related: ["compound-interest", "loan-emi"] }),
  simpleCalculator({ id: "gst", category: "finance", subcategory: shop, icon: BadgePercent, keywords: ["gst", "vat", "sales tax", "tax"],
    fields: [money("amount"), rate("taxRate", 100)], defaults: { amount: 1000, taxRate: 18 },
    compute: c.gst, outputs: [{ key: "totalWithTax", kind: "money" }, { key: "taxAdded", kind: "money" }], related: ["gst-inclusive", "discount"] }),
  simpleCalculator({ id: "gst-inclusive", category: "finance", subcategory: shop, icon: BadgePercent, keywords: ["gst inclusive", "tax included", "reverse gst", "vat inclusive", "mrp"],
    fields: [money("amount"), rate("taxRate", 100)], defaults: { amount: 1180, taxRate: 18 },
    compute: c.gstInclusive, outputs: [{ key: "netOfTax", kind: "money" }, { key: "taxIncluded", kind: "money" }, { key: "halfTax", kind: "money" }], related: ["gst", "discount"] }),
  simpleCalculator({ id: "discount", category: "finance", subcategory: shop, icon: Tag, keywords: ["discount", "sale", "off", "price"],
    fields: [money("price"), rate("discountRate", 100)], defaults: { price: 2000, discountRate: 25 },
    compute: c.discount, outputs: [{ key: "finalPrice", kind: "money" }, { key: "saving", kind: "money" }], related: ["gst", "percentage"] }),
];
