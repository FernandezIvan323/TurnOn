import { useEffect } from "react";

const DEFAULT_TITLE = "TurnOn · Software para restaurantes";
const SUFFIX = " · TurnOn";

export function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title}${SUFFIX}` : DEFAULT_TITLE;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
