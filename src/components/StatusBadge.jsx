const toneStyles = {
  blue: "border-blue-300/60 bg-blue-500/10 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  indigo: "border-indigo-300/60 bg-indigo-500/10 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300",
  amber: "border-amber-300/60 bg-amber-500/10 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  teal: "border-teal-300/60 bg-teal-500/10 text-teal-600 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300",
  green: "border-emerald-300/60 bg-emerald-500/10 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
};

export default function StatusBadge({ status }) {
  const isPulse = status.pulse;

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border px-2.5 text-xs font-semibold ${toneStyles[status.tone]} ${isPulse ? "animate-pulse-glow" : ""}`}
    >
      {status.label}
    </span>
  );
}
