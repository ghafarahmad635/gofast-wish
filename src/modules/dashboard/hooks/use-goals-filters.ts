import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { DEFAULT_PAGE } from "@/constants";

export const useGoalsFilters = () => {
  return useQueryStates({
   

    completedPage: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),

    inCompletedPage: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),
    

   
    edit: parseAsString
      .withDefault("") // empty string means “no edit modal open”
      .withOptions({ clearOnDefault: true }),
  });
};
