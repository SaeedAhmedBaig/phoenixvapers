import { cn } from "../../lib/utils";

export function VariantSelector({ label, options, selected, onSelect }) {
  if (options.length <= 1) return null;

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-foreground">{label}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-bold transition",
              selected === option
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary hover:text-primary",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
