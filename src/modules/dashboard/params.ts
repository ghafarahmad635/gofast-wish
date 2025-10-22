

import { createLoader, parseAsInteger, parseAsString } from "nuqs/server";

import { DEFAULT_PAGE } from "@/constants";

 const filterSearchParams = {
   
    completedPage: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
    inCompletedPage: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
     edit: parseAsString
      .withDefault("") // empty string means “no edit modal open”
      .withOptions({ clearOnDefault: true }),
 }
  


  export const loadSearchParams = createLoader(filterSearchParams)