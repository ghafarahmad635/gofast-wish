"use client";

import { useEffect, useState } from "react";
import { Search, XCircleIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useOrdersAdminFilters } from "../../hooks/use-admin-orders";


const OrdersFilters = () => {
  const [filters, setFilters] = useOrdersAdminFilters();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchTerm !== filters.search) {
        setFilters((prev) => ({
          ...prev,
          search: searchTerm,
          page: 1,
        }));
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, filters.search, setFilters]);

  const isModified = !!filters.search;

  const clearFilters = () => {
    setFilters({
      search: null,
      page: 1,
    });
    setSearchTerm("");
  };

  return (
    <ScrollArea>
      <div className="flex items-center gap-x-2 p-1 justify-between">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-8 pr-3 py-2 text-sm rounded-md border border-gray-300 bg-white w-auto min-w-[250px]"
          />
        </div>

        {/* Clear button */}
        <div className="flex gap-x-2 items-center">
          {isModified && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-1"
            >
              <XCircleIcon className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default OrdersFilters;
