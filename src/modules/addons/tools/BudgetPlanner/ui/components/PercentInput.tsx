"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

function toNumber(raw: string) {
  const n = Number(raw.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function PercentInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.1,
  placeholder,
  ...props
}: {
  value: number | undefined;
  onChange: (num: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
} & React.ComponentProps<typeof Input>) {
  const [text, setText] = useState(value != null ? String(value) : "");

  const commit = (raw: string) => {
    let n = toNumber(raw);
    n = Math.max(min, Math.min(max, n));
    // round to step
    const scaled = Math.round(n / step) * step;
    onChange(Number(scaled.toFixed(2)));
    setText(`${scaled}`);
  };

  return (
    <div className="relative">
      <Input
        inputMode="decimal"
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/[^\d.]/g, "");
          setText(cleaned);
          onChange(toNumber(cleaned));
        }}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const base = Math.max(min, Math.min(max, toNumber(text || "0")));
            const next = e.key === "ArrowUp" ? base + step : base - step;
            const clamped = Math.max(min, Math.min(max, next));
            onChange(Number(clamped.toFixed(2)));
            setText(String(Number(clamped.toFixed(2))));
          }
        }}
        {...props}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
    </div>
  );
}
