import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { DEFAULT_PAGE } from "@/constants";

export const useGoalsFilters = () => {
  return useQueryStates({
    search: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),

    page: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),

    // ✅ Safe fallback for older nuqs
    edit: parseAsString
      .withDefault("") // empty string means “no edit modal open”
      .withOptions({ clearOnDefault: true }),
  });
};
