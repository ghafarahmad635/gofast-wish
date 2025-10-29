

import {
  parseAsString,
  parseAsInteger,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs'
import { DEFAULT_PAGE } from '@/constants'

const sortValues = ['asc', 'desc'] as const

const params = {
  search: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),
  status: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),
  priority: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""), // "low" | "medium" | ...
  sort: parseAsStringLiteral(["asc","desc"]).withOptions({ clearOnDefault: true }).withDefault("desc"),
  page: parseAsInteger.withOptions({ clearOnDefault: true }).withDefault(DEFAULT_PAGE),
  edit: parseAsString.withOptions({ clearOnDefault: true }).withDefault(""),
}


export const useGoalsFilters = () => useQueryStates(params)
