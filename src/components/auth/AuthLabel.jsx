export function AuthLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-ink-600 dark:text-white"
    >
      {children}
    </label>
  );
}
