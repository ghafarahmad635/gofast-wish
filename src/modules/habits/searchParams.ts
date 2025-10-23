import { createLoader, parseAsStringLiteral } from "nuqs/server";
const sortValues = ["daily", "weekly", "monthly"] as const

export const params={
      frequency: parseAsStringLiteral(sortValues)
      .withOptions({ clearOnDefault: true })
      .withDefault('daily'),
}

export const loadHabitsFilters=createLoader(params)