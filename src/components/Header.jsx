import ThemeToggle from "./ThemeToggle";

export default function Header({ title, subtitle, right }) {
  return (
    <header className="mb-4 flex flex-wrap items-start justify-between gap-2 sm:mb-6">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-semibold text-ink-900 dark:text-white sm:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-ink-600 dark:text-white">{subtitle}</p>
        )}
      </div>
      <div className="flex shrink-0 flex-nowrap items-center gap-2">
        {right}
        {/* En móvil el toggle va en la topbar del Layout */}
        <div className="hidden shrink-0 lg:block">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
