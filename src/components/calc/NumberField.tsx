import { useEffect, useId, useState, type ReactNode } from "react";
import { Field, Input } from "@/design-system/minimal-and-sleek-69c4a4";
import { decimalSeparator, localeFor, type NumberFormatId } from "@/lib/format";

/** Turns typed text into a number for the given format. Returns NaN when empty/invalid. */
export function parseLocalized(text: string, fmt: NumberFormatId): number {
  const dec = decimalSeparator(fmt);
  const cleaned = text.replace(new RegExp(`[^0-9\\-${dec === "," ? "," : "."}]`, "g"), "").replace(dec, ".");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return NaN;
  return Number(cleaned);
}

/** Adds thousand separators to typed text while keeping what the user typed after the decimal mark. */
export function formatTyping(text: string, fmt: NumberFormatId): string {
  const dec = decimalSeparator(fmt);
  const neg = text.trim().startsWith("-");
  const stripped = text.replace(new RegExp(`[^0-9${dec === "," ? "," : "."}]`, "g"), "");
  const [intPart, ...rest] = stripped.split(dec);
  const frac = rest.join("");
  const hasDec = stripped.includes(dec);
  const intNum = intPart === "" ? "" : new Intl.NumberFormat(localeFor(fmt), { maximumFractionDigits: 0, useGrouping: true }).format(Number(intPart));
  return `${neg ? "-" : ""}${intNum || (hasDec ? "0" : "")}${hasDec ? dec + frac : ""}`;
}

function toText(v: number, fmt: NumberFormatId) {
  if (!Number.isFinite(v)) return "";
  return new Intl.NumberFormat(localeFor(fmt), { maximumFractionDigits: 6 }).format(v);
}

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  numberFormat: NumberFormatId;
  error?: string | undefined;
  hint?: ReactNode | undefined;
  prefix?: ReactNode | undefined;
  suffix?: ReactNode | undefined;
  slider?: { min: number; max: number; step: number } | undefined;
  allowNegative?: boolean | undefined;
}

export function NumberField({ label, value, onChange, numberFormat, error, hint, prefix, suffix, slider, allowNegative }: Props) {
  const id = useId();
  const [text, setText] = useState(() => toText(value, numberFormat));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(toText(value, numberFormat));
  }, [value, numberFormat, focused]);

  return (
    <Field label={label} htmlFor={id} error={error} hint={hint}>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
        <Input
          id={id}
          size="lg"
          inputMode="decimal"
          autoComplete="off"
          className="tabular-nums"
          value={text}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            let raw = e.target.value;
            if (!allowNegative) raw = raw.replace(/-/g, "");
            const next = formatTyping(raw, numberFormat);
            setText(next);
            onChange(parseLocalized(next, numberFormat));
          }}
        />
        {suffix}
      </div>
      {slider && (
        <input
          type="range"
          aria-label={label}
          min={slider.min}
          max={slider.max}
          step={slider.step}
          value={Number.isFinite(value) ? Math.min(Math.max(value, slider.min), slider.max) : slider.min}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-11 w-full cursor-pointer accent-accent"
        />
      )}
    </Field>
  );
}
