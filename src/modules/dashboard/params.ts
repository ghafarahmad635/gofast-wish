

import { createLoader, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs/server";

import { DEFAULT_PAGE } from "@/constants";
const sortValues = ["daily", "weekly", "monthly"] as const
 const filterSearchParams = {
   
    completedPage: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
    inCompletedPage: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
     edit: parseAsString
      .withDefault("") 
      .withOptions({ clearOnDefault: true }),
    frequency: parseAsStringLiteral(sortValues)
      .withOptions({ clearOnDefault: true })
      .withDefault('daily'),
 }
  


  export const loadSearchParams = createLoader(filterSearchParams)