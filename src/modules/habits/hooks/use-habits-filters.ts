import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

const sortValues = ["daily", "weekly", "monthly"] as const
export const useHabitsFilters = () => {
  return useQueryStates({
 
    frequency: parseAsStringLiteral(sortValues)
      .withOptions({ clearOnDefault: true })
      .withDefault('daily'),

    
    

    
  });
};
