import { parseAsInteger, parseAsString, useQueryStates, parseAsStringEnum } from "nuqs";

import { DEFAULT_PAGE } from "@/constants";

import { UserBanStatus, UserEmailStatus, UserLoginStatus, UserRole } from "../types";

export const useUsersAdminFilters = () => {
  return useQueryStates({
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
    ban_status: parseAsStringEnum(Object.values(UserBanStatus)),
    role: parseAsStringEnum(Object.values(UserRole)),
    login_status : parseAsStringEnum(Object.values(UserLoginStatus)),
    email_status : parseAsStringEnum(Object.values(UserEmailStatus)),
  });
};
