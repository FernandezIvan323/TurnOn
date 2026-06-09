import ThemeToggle from "./ThemeToggle";

export default function Header({ title, subtitle, right }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-800 dark:text-obsidian-50">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 dark:text-obsidian-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {right}
        <ThemeToggle />
      </div>
    </header>
  );
}
