import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

const sortValues = ["daily", "weekly", "monthly"] as const
export const useHabitsFilters = () => {
  return useQueryStates({
 
    frequency: parseAsStringLiteral(sortValues)
      .withOptions({ clearOnDefault: true })
      .withDefault('daily'),

    editHabit:parseAsString
      .withDefault("") 
      .withOptions({ clearOnDefault: true }),
    
    habitPage: parseAsInteger
          .withDefault(1)
          .withOptions({ clearOnDefault: true }),

    
    

    
  });
};
