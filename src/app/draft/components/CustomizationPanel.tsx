"use client";

import { CustomizationOptions } from "../lib/types";
import { Check } from "lucide-react";

interface Props {
  options: CustomizationOptions;
  onChange: (options: CustomizationOptions) => void;
}

const colorPresets = [
  "#6366f1", "#2563eb", "#0ea5e9", "#10b981",
  "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899",
  "#1a1a2e", "#b8860b",
];

const fontOptions = [
  { label: "Template Default", value: null },
  { label: "Inter", value: "Inter" },
  { label: "Georgia", value: "Georgia" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Garamond", value: "Garamond" },
];

export default function CustomizationPanel({ options, onChange }: Props) {
  const update = (partial: Partial<CustomizationOptions>) => {
    onChange({ ...options, ...partial });
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-5">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Customise
      </p>

      {/* Accent Color */}
      <div>
        <p className="text-xs text-zinc-400 mb-2">Accent Colour</p>
        <div className="flex flex-wrap gap-2">
          {colorPresets.map((color) => (
            <button
              key={color}
              onClick={() =>
                update({
                  accentColor: options.accentColor === color ? null : color,
                })
              }
              className="relative w-7 h-7 rounded-full transition-transform hover:scale-110"
              style={{ background: color }}
            >
              {options.accentColor === color && (
                <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />
              )}
            </button>
          ))}
          <input
            type="color"
            value={options.accentColor || "#6366f1"}
            onChange={(e) => update({ accentColor: e.target.value })}
            className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent"
            title="Custom colour"
          />
        </div>
      </div>

      {/* Font */}
      <div>
        <p className="text-xs text-zinc-400 mb-2">Font</p>
        <select
          value={options.fontOverride || ""}
          onChange={(e) =>
            update({ fontOverride: e.target.value || null })
          }
          className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-accent"
        >
          {fontOptions.map((f) => (
            <option key={f.label} value={f.value || ""} className="bg-zinc-900">
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Spacing */}
      <div>
        <p className="text-xs text-zinc-400 mb-2">Spacing</p>
        <div className="flex gap-1">
          {(["compact", "normal", "spacious"] as const).map((s) => (
            <button
              key={s}
              onClick={() => update({ spacing: s })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                options.spacing === s
                  ? "bg-accent/20 text-accent"
                  : "bg-white/[0.03] text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Margins */}
      <div>
        <p className="text-xs text-zinc-400 mb-2">Page Margins</p>
        <div className="flex gap-1">
          {(["standard", "narrow"] as const).map((m) => (
            <button
              key={m}
              onClick={() => update({ margins: m })}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                options.margins === m
                  ? "bg-accent/20 text-accent"
                  : "bg-white/[0.03] text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
