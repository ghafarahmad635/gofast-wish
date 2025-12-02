import { DEFAULT_PAGE } from "@/constants";
import {
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from "./types";

const filterSearchParams = {
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
};

export const loadSearchParams = createLoader(filterSearchParams);
