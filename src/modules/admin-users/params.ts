import { DEFAULT_PAGE } from "@/constants";
import { createLoader, parseAsInteger, parseAsString, parseAsStringEnum } from "nuqs/server";
import { UserBanStatus, UserEmailStatus, UserLoginStatus, UserRole } from "./types";

 const filterSearchParams = {
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
    ban_status: parseAsStringEnum(Object.values(UserBanStatus)),
    role: parseAsStringEnum(Object.values(UserRole)),
      login_status : parseAsStringEnum(Object.values(UserLoginStatus)),
    email_status : parseAsStringEnum(Object.values(UserEmailStatus)),
 }
   export const loadSearchParams = createLoader(filterSearchParams)