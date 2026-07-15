type ResultLoadingProps = {
  label: string;
};

export default function ResultLoading({ label }: ResultLoadingProps) {
  return (
    <div
      className="flex min-h-40 w-full flex-col items-center justify-center border border-[#B8B8B8] bg-white px-6 py-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex h-8 items-end gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className="result-loading-bar block w-1.5 bg-[#D4943E]"
            style={{ animationDelay: `${bar * 120}ms` }}
          />
        ))}
      </div>
      <p className="mt-5 text-sm text-[#4A7865]">{label}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        The recipe service may need a moment to wake up.
      </p>
    </div>
  );
}
