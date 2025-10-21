

import { createLoader, parseAsInteger, parseAsString } from "nuqs/server";

import { DEFAULT_PAGE } from "@/constants";

 const filterSearchParams = {
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
     edit: parseAsString
      .withDefault("") // empty string means “no edit modal open”
      .withOptions({ clearOnDefault: true }),
 }
  


  export const loadSearchParams = createLoader(filterSearchParams)