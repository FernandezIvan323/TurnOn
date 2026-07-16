import { Link } from "react-router-dom";

export default function Brand() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="TurnOn inicio">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-soft ring-1 ring-black/10 dark:ring-white/15">
        <img
          src="/favicon.svg"
          alt=""
          className="h-full w-full object-cover"
          width={44}
          height={44}
        />
      </span>
      <span>
        <span className="block text-base font-bold leading-tight text-ink-900 dark:text-white">
          TurnOn
        </span>
        <span className="block text-xs font-medium text-wine-600 dark:text-wine-300">
          Gestión del restaurant
        </span>
      </span>
    </Link>
  );
}
