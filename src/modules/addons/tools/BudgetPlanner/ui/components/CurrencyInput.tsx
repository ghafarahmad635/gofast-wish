"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

function toNumber(raw: string) {
  const n = Number(raw.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}
function toPrettyUSD(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n).replace("$", ""); // we draw our own $
}

export function CurrencyInput({
  value,
  onChange,
  step = 100,
  min = 0,
  placeholder,
  ...props
}: {
  value: number | undefined;
  onChange: (num: number) => void;
  step?: number;
  min?: number;
  placeholder?: string;
} & React.ComponentProps<typeof Input>) {
  const [text, setText] = useState<string>(value != null ? String(value) : "");

  // sync from parent when value changes externally
  useEffect(() => {
    if (document.activeElement !== (props as any).ref?.current) {
      setText(value != null && value !== 0 ? String(value) : "");
    } else {
      // if focused, don't override the user's typing
      // still ensure we at least have a string
      if (text === "" && value) setText(String(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = (raw: string) => {
    const n = Math.max(min, toNumber(raw));
    const snapped = n - (n % step);
    onChange(snapped);
    setText(toPrettyUSD(snapped));
  };

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
      <Input
        inputMode="numeric"
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/[^\d]/g, "");
          setText(cleaned);
          // live update numeric value without formatting so form state is useful immediately
          const n = Math.max(min, toNumber(cleaned));
          onChange(n);
        }}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const base = Math.max(min, toNumber(text || "0"));
            const next = e.key === "ArrowUp" ? base + step : Math.max(min, base - step);
            onChange(next);
            setText(String(next)); // show raw number while focused
          }
        }}
        className="pl-6"
        {...props}
      />
    </div>
  );
}
