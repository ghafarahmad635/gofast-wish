import { createLoader, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs/server";
const sortValues = ["daily", "weekly", "monthly"] as const

export const params={
      frequency: parseAsStringLiteral(sortValues)
      .withOptions({ clearOnDefault: true })
      .withDefault('daily'),

      editHabit: parseAsString
      .withDefault("") // empty string means “no edit modal open”
      .withOptions({ clearOnDefault: true }),

       habitPage: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
}

export const loadHabitsFilters=createLoader(params)