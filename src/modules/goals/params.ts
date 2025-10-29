import {
  createLoader,
  parseAsString,
  parseAsInteger,
  parseAsStringLiteral,
} from 'nuqs/server'
import { DEFAULT_PAGE } from '@/constants'

const sortValues = ['asc', 'desc'] as const

const goalsFilterParams = {
  search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
  status: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
  priority: parseAsString.withDefault('').withOptions({ clearOnDefault: true }), // ✅ single value
  sort: parseAsStringLiteral(sortValues)
    .withDefault('desc')
    .withOptions({ clearOnDefault: true }),
  page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
  edit: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
}

export const loadGoalsFilterParams = createLoader(goalsFilterParams)
