import {
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs";

import { DEFAULT_PAGE } from "@/constants";

import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "../types";

export const useSubscriptionAdminFilters = () => {
  return useQueryStates({
    search: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),

    page: parseAsInteger
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),

    plan: parseAsStringEnum(
      Object.values(SubscriptionPlan),
    ).withOptions({ clearOnDefault: true }),

    status: parseAsStringEnum(
      Object.values(SubscriptionStatus),
    ).withOptions({ clearOnDefault: true }),
  });
};
