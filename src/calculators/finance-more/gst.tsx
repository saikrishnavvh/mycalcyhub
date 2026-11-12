import { BadgePercent } from "lucide-react";
import { t } from "@/i18n";
import { Segmented } from "@/components/calc/Segmented";
import { simpleCalculator, schemaFor, type FieldSpec } from "../kit/simple";
import type { InputsProps, ResultsProps } from "../types";
import * as c from "./compute";

type Vals = Record<string, number>;
const fields: FieldSpec[] = [
  { key: "amount", kind: "money", positive: true, slider: { min: 0, max: 10_000_000, step: 10_000 } },
  { key: "taxRate", kind: "percent", max: 100, slider: { min: 0, max: 100, step: 0.1 } },
];
const outputs = (inc: boolean) => (inc
  ? [{ key: "net", kind: "money" }, { key: "tax", kind: "money" }, { key: "halfTax", kind: "money" }, { key: "total", kind: "money" }]
  : [{ key: "total", kind: "money" }, { key: "tax", kind: "money" }, { key: "halfTax", kind: "money" }, { key: "net", kind: "money" }]) as { key: string; kind: "money" }[];
const base = (inc: boolean) => simpleCalculator({ id: "gst", category: "finance", subcategory: t("subcategory.tax"), icon: BadgePercent,
  keywords: ["gst", "vat", "sales tax", "tax", "inclusive", "exclusive", "reverse gst"], fields, defaults: { amount: 1000, taxRate: 18, inclusive: 0 },
  compute: c.gst, outputs: outputs(inc), related: ["discount", "percentage"] });
const exc = base(false), inc = base(true);

function Inputs(props: InputsProps<Vals>) {
  const mode = props.value["inclusive"] === 1 ? "inc" : "exc";
  return (
    <div className="flex flex-col gap-6">
      <Segmented label={t("gst.mode")} value={mode} onChange={(m) => props.onChange({ ...props.value, inclusive: m === "inc" ? 1 : 0 })}
        options={[{ value: "exc", label: t("gst.exclusive") }, { value: "inc", label: t("gst["inclusive"]") }]} />
      <exc.Inputs {...props} />
    </div>
  );
}

/** GST with a tax-extra / tax-included switch; results reorder so the headline fits the chosen mode. */
export const gstCalculator = {
  ...exc,
  inputSchema: schemaFor([...fields, { key: "inclusive", kind: "number", max: 1 }]),
  Inputs,
  Results: (p: ResultsProps<Vals, Vals>) => (p.input["inclusive"] === 1 ? <inc.Results {...p} /> : <exc.Results {...p} />),

  exportRows: (i: Vals, r: Vals) => (i["inclusive"] === 1 ? inc : exc).exportRows!(i, r),
};
